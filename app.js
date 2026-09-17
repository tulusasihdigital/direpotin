const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdBjDmKwBsnkBtz-wF7mBEW5mhHlZhTT0IPY8Rlv0e8WlnFJQMxteqosgoVRmyCYlDNNx0NqgFnd49/pub?gid=55893209&single=true&output=csv";

let DATA={monthly:[],pics:[]}, trendChart, rateChart;
const $=id=>document.getElementById(id);
const nf=new Intl.NumberFormat("id-ID");
const pct=n=>`${Number(n).toFixed(2).replace(".",",")}%`;

function parseCSV(text){
 let rows=[],row=[],cell="",q=false;
 for(let i=0;i<text.length;i++){let c=text[i],n=text[i+1];
  if(c=='"'){if(q&&n=='"'){cell+='"';i++;}else q=!q}
  else if(c==','&&!q){row.push(cell);cell=""}
  else if((c=='\n'||c=='\r')&&!q){if(c=='\r'&&n=='\n')i++;row.push(cell);rows.push(row);row=[];cell=""}
  else cell+=c;
 }
 if(cell.length||row.length){row.push(cell);rows.push(row)} return rows;
}
const num=x=>{let s=String(x??"").trim().replace(/\./g,"").replace(",","." ).replace("%","");let n=parseFloat(s);return Number.isFinite(n)?n:0};
const clean=x=>String(x??"").trim();

function parseSheet(rows){
 const months=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September"];
 const monthly=months.map(m=>({month:m,leads:0,closing:0,successRate:0}));
 let tr=-1,cr=-1,rr=-1;
 rows.forEach((r,i)=>{let x=clean(r[0]).toLowerCase();if(x=="total leads/bulan")tr=i;if(x=="closing")cr=i;if(x=="success rate")rr=i});
 if(tr>=0)monthly.forEach((m,i)=>m.leads=num(rows[tr][1+i*2]));
 if(cr>=0)monthly.forEach((m,i)=>m.closing=num(rows[cr][1+i]));
 if(rr>=0)monthly.forEach((m,i)=>m.successRate=num(rows[rr][1+i]));
 let pics=[],inPic=false;
 rows.forEach(r=>{
   let name=clean(r[0]);
   if(name=="PIC"){inPic=true;return}
   if(inPic&&name=="Property"){inPic=false;return}
   if(inPic&&name&&name!="Total / Bulan"&&!/^Q[123] /.test(name)){
     months.forEach((m,i)=>pics.push({name,month:m,leads:num(r[1+i*2]),closing:num(r[3+i*2])}));
   }
 });
 return {monthly,pics};
}
async function load(){
 try{
  if(SHEET_CSV_URL){
   let res=await fetch(SHEET_CSV_URL,{cache:"no-store"}); if(!res.ok)throw Error("fetch failed");
   DATA=parseSheet(parseCSV(await res.text())); $("status").textContent="Live • Google Sheets";
  }else{
   DATA=await (await fetch("data.json",{cache:"no-store"})).json(); $("status").textContent="Demo • data.json";
  }
 }catch(e){console.error(e);$("status").textContent="Gagal memuat data"}
 $("month").innerHTML='<option value="">Semua bulan</option>'+DATA.monthly.map(x=>`<option>${x.month}</option>`).join("");
 render();
}
function render(){
 let sm=$("month").value,search=$("search").value.toLowerCase();
 let months=sm?DATA.monthly.filter(x=>x.month===sm):DATA.monthly;
 let leads=months.reduce((a,b)=>a+b.leads,0),closing=months.reduce((a,b)=>a+b.closing,0);
 $("totalLeads").textContent=nf.format(leads);$("totalClosing").textContent=nf.format(closing);
 $("successRate").textContent=pct(leads?closing/leads*100:0);$("monthCount").textContent=months.length;
 let rows=DATA.pics.filter(r=>(!sm||r.month===sm)&&(!search||r.name.toLowerCase().includes(search)));
 $("tbody").innerHTML=rows.map(r=>{let sr=r.leads?r.closing/r.leads*100:0;return `<tr><td>${esc(r.name)}</td><td>${r.month}</td><td class="num">${nf.format(r.leads)}</td><td class="num">${nf.format(r.closing)}</td><td class="num">${pct(sr)}</td></tr>`}).join("")||'<tr><td colspan="5" style="text-align:center;padding:28px;color:#718096">Tidak ada data.</td></tr>';
 $("rowCount").textContent=`${rows.length} rows`;
 draw(months);
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function draw(months){
 if(trendChart)trendChart.destroy();if(rateChart)rateChart.destroy();
 trendChart=new Chart($("trend"),{type:"line",data:{labels:months.map(x=>x.month),datasets:[
 {label:"Leads",data:months.map(x=>x.leads),borderWidth:3,tension:.35},
 {label:"Closing",data:months.map(x=>x.closing),borderWidth:3,tension:.35}
 ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true}}}});
 rateChart=new Chart($("rate"),{type:"line",data:{labels:months.map(x=>x.month),datasets:[
 {label:"Success Rate",data:months.map(x=>x.successRate),borderWidth:3,tension:.35,fill:true}
 ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v+"%"}}}}});
}
["search","month","dataset"].forEach(id=>$(id).addEventListener("input",render));
$("reset").onclick=()=>{$("search").value="";$("month").value="";$("dataset").value="all";render()};
load();
