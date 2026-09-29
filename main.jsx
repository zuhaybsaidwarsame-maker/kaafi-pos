import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3, Boxes, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard,
  FileText, LayoutDashboard, Menu, PackagePlus, Pencil, Plus, Printer,
  Receipt, Search, Settings, ShoppingCart, Trash2, TrendingUp, UserRound,
  Users, X, Minus, CheckCircle2, AlertTriangle
} from "lucide-react";
import "./index.css";

const KEY = "somali-pos-v1";

const seed = {
  products: [
    {id:"p1", name:"Caano", price:1.00, stock:20, category:"Cunto"},
    {id:"p2", name:"Bariis", price:5.00, stock:15, category:"Cunto"},
    {id:"p3", name:"Biyo", price:0.50, stock:40, category:"Cabitaan"},
    {id:"p4", name:"Sonkor", price:2.50, stock:18, category:"Cunto"},
    {id:"p5", name:"Buskud", price:1.25, stock:25, category:"Cunto"},
    {id:"p6", name:"Saliid", price:4.50, stock:10, category:"Cunto"}
  ],
  sales: [],
  customers: [],
  settings: {storeName:"DUKAANKAAGA", taxRate:0, currency:"$", receiptFooter:"Mahadsanid!"}
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || seed; }
  catch { return seed; }
}
function money(n, currency="$") { return `${currency}${Number(n || 0).toFixed(2)}`; }
function uid(prefix="id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }

function App() {
  const [db,setDb] = useState(load);
  const [page,setPage] = useState("dashboard");
  const [cart,setCart] = useState([]);
  const [query,setQuery] = useState("");
  const [taxEnabled,setTaxEnabled] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const [receipt,setReceipt] = useState(null);
  const [toast,setToast] = useState("");

  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(db)),[db]);
  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(""),2200); return()=>clearTimeout(t);}},[toast]);

  const products = db.products;
  const filtered = products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax = taxEnabled ? subtotal*(Number(db.settings.taxRate)||0)/100 : 0;
  const total = subtotal+tax;

  const addToCart = p => {
    const existing=cart.find(i=>i.id===p.id);
    const qty=existing?existing.qty+1:1;
    if(qty>p.stock){setToast("Kaydka alaabtu kuma filna.");return;}
    setCart(existing?cart.map(i=>i.id===p.id?{...i,qty}:i):[...cart,{...p,qty:1}]);
  };
  const changeQty=(id,delta)=>{
    setCart(cart.map(i=>i.id===id?{...i,qty:Math.max(0,Math.min(i.qty+delta,products.find(p=>p.id===id)?.stock||0))}:i).filter(i=>i.qty>0));
  };
  const checkout=(customerId=null,paid=total)=>{
    if(!cart.length)return;
    const sale={id:uid("sale"),date:new Date().toISOString(),items:cart,subtotal,tax,total,paid:Number(paid)||0,customerId};
    setDb(d=>({...d,products:d.products.map(p=>{const i=cart.find(x=>x.id===p.id);return i?{...p,stock:p.stock-i.qty}:p}),sales:[sale,...d.sales]}));
    if(customerId){
      setDb(d=>({...d,customers:d.customers.map(c=>c.id===customerId?{...c,paid:Number(c.paid||0)+Number(paid||0),debt:Math.max(0,Number(c.debt||0)+(total-Number(paid||0)))}:c)}));
    }
    setReceipt(sale); setCart([]); setToast("Iibka waa la dhammeeyay."); 
  };

  const todaySales=db.sales.filter(s=>new Date(s.date).toDateString()===new Date().toDateString());
  const todayRevenue=todaySales.reduce((a,s)=>a+s.total,0);
  const revenue=db.sales.reduce((a,s)=>a+s.total,0);
  const lowStock=products.filter(p=>p.stock<=5).length;
  const topProducts=useMemo(()=>{
    const map={}; db.sales.forEach(s=>s.items.forEach(i=>map[i.id]=(map[i.id]||0)+i.qty));
    return Object.entries(map).map(([id,qty])=>({p:products.find(x=>x.id===id),qty})).filter(x=>x.p).sort((a,b)=>b.qty-a.qty).slice(0,5);
  },[db.sales,products]);

  const nav=[
    ["dashboard","Dashboard",LayoutDashboard],
    ["sales","Iibka",ShoppingCart],
    ["inventory","Alaabta",Boxes],
    ["customers","Macaamiisha & Deynta",Users],
    ["reports","Warbixinnada",BarChart3],
    ["settings","Dejinta",Settings]
  ];

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-950 text-white transform transition-transform lg:translate-x-0 ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>
      <div className="p-5 flex items-center justify-between">
        <div><div className="text-xl font-black tracking-tight">Somali POS</div><div className="text-xs text-slate-400 mt-1">Nidaamka iibka</div></div>
        <button className="lg:hidden" onClick={()=>setMobileOpen(false)}><X/></button>
      </div>
      <nav className="px-3 space-y-1">
        {nav.map(([id,label,Icon])=><button key={id} onClick={()=>{setPage(id);setMobileOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${page===id?"bg-teal-600":"text-slate-300 hover:bg-slate-900"}`}><Icon size={19}/>{label}</button>)}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4"><div className="rounded-2xl bg-slate-900 p-4 text-xs text-slate-400">Xogta waxaa lagu kaydiyaa browser-kaaga.</div></div>
    </aside>

    <main className="lg:ml-64 min-h-screen">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="h-16 px-4 sm:px-6 flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={()=>setMobileOpen(true)}><Menu/></button>
          <div className="flex-1"><h1 className="font-bold text-lg">{nav.find(n=>n[0]===page)?.[1]}</h1></div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500"><CircleDollarSign size={16}/>{db.settings.currency} USD</div>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {page==="dashboard" && <Dashboard todayRevenue={todayRevenue} products={products} lowStock={lowStock} revenue={revenue} sales={db.sales} currency={db.settings.currency}/>}
        {page==="sales" && <Sales products={filtered} query={query} setQuery={setQuery} cart={cart} addToCart={addToCart} changeQty={changeQty} subtotal={subtotal} tax={tax} total={total} taxEnabled={taxEnabled} setTaxEnabled={setTaxEnabled} settings={db.settings} checkout={checkout} customers={db.customers} currency={db.settings.currency}/>}
        {page==="inventory" && <Inventory db={db} setDb={setDb} toast={setToast}/>}
        {page==="customers" && <Customers db={db} setDb={setDb}/>}
        {page==="reports" && <Reports sales={db.sales} topProducts={topProducts} currency={db.settings.currency}/>}
        {page==="settings" && <SettingsPage db={db} setDb={setDb}/>}
      </div>
    </main>

    {toast && <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex gap-2 items-center"><CheckCircle2 size={18}/>{toast}</div>}
    {receipt && <ReceiptModal sale={receipt} settings={db.settings} close={()=>setReceipt(null)}/>}
  </div>
}

function Metric({icon:Icon,label,value,sub}){return <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex items-center justify-between"><div className="text-sm text-slate-500">{label}</div><div className="p-2 rounded-xl bg-teal-50 text-teal-700"><Icon size={19}/></div></div><div className="text-2xl font-black mt-3">{value}</div>{sub&&<div className="text-xs text-slate-400 mt-1">{sub}</div>}</div>}

function Dashboard({todayRevenue,products,lowStock,revenue,sales,currency}){
 return <div className="space-y-6">
  <div><h2 className="text-2xl font-black">Ku soo dhowow 👋</h2><p className="text-slate-500 mt-1">Halkan ka eeg xaaladda dukaankaaga.</p></div>
  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
   <Metric icon={TrendingUp} label="Iibka maanta" value={money(todayRevenue,currency)}/>
   <Metric icon={Boxes} label="Tirada alaabta" value={products.length}/>
   <Metric icon={AlertTriangle} label="Alaabta kaydkeedu yar yahay" value={lowStock} sub="Stock ≤ 5"/>
   <Metric icon={CircleDollarSign} label="Wadarta lacagta iibka" value={money(revenue,currency)}/>
  </div>
  <div className="grid lg:grid-cols-2 gap-5">
   <div className="bg-white border rounded-2xl p-5"><h3 className="font-bold mb-4">Iibkii ugu dambeeyay</h3>{sales.slice(0,6).map(s=><div key={s.id} className="flex justify-between py-3 border-b last:border-0"><div><div className="font-semibold text-sm">{new Date(s.date).toLocaleString("so-SO")}</div><div className="text-xs text-slate-400">{s.items.length} nooc</div></div><b>{money(s.total,currency)}</b></div>)}{!sales.length&&<Empty text="Weli iib lama diiwaangelin."/>}</div>
   <div className="bg-white border rounded-2xl p-5"><h3 className="font-bold mb-4">Kayd yar</h3>{products.filter(p=>p.stock<=5).map(p=><div key={p.id} className="flex justify-between py-3 border-b last:border-0"><span>{p.name}</span><span className="text-red-600 font-bold">{p.stock}</span></div>)}{!lowStock&&<Empty text="Dhammaan alaabtu stock fiican ayay leedahay."/>}</div>
  </div>
 </div>
}

function Sales({products,query,setQuery,cart,addToCart,changeQty,subtotal,tax,total,taxEnabled,setTaxEnabled,settings,checkout,customers,currency}){
 const [paid,setPaid]=useState("");
 const [customerId,setCustomerId]=useState("");
 return <div className="grid xl:grid-cols-[1fr_390px] gap-5 items-start">
  <section>
   <div className="relative mb-5"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Raadi alaab..." className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-teal-500"/></div>
   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
    {products.map(p=><button disabled={!p.stock} key={p.id} onClick={()=>addToCart(p)} className="text-left bg-white border rounded-2xl p-4 hover:border-teal-400 hover:shadow-md transition disabled:opacity-50">
      <div className="h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 mb-3"><PackagePlus size={34}/></div>
      <div className="font-bold truncate">{p.name}</div><div className="text-xs text-slate-400">{p.category}</div>
      <div className="flex justify-between items-center mt-3"><b>{money(p.price,currency)}</b><span className="text-xs text-slate-500">Stock {p.stock}</span></div>
      <div className="mt-3 text-center bg-teal-600 text-white rounded-lg py-2 text-sm font-bold">+ Ku dar</div>
    </button>)}
   </div>
   {!products.length&&<Empty text="Alaab lama helin."/>}
  </section>
  <aside className="bg-white border rounded-2xl shadow-sm xl:sticky xl:top-20 overflow-hidden">
   <div className="p-4 border-b flex justify-between"><div><h3 className="font-black">Risiidhka</h3><p className="text-xs text-slate-400">{cart.length} nooc</p></div><ShoppingCart className="text-teal-600"/></div>
   <div className="p-4 max-h-[380px] overflow-auto space-y-3">{cart.map(i=><div key={i.id} className="flex gap-3 items-center"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><PackagePlus size={16}/></div><div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{i.name}</div><div className="text-xs text-slate-500">{money(i.price,currency)} × {i.qty}</div></div><div className="flex items-center gap-1"><button onClick={()=>changeQty(i.id,-1)} className="p-1.5 rounded bg-slate-100"><Minus size={14}/></button><span className="w-5 text-center text-sm">{i.qty}</span><button onClick={()=>changeQty(i.id,1)} className="p-1.5 rounded bg-slate-100"><Plus size={14}/></button></div></div>)}{!cart.length&&<Empty text="Cart-ku waa madhan."/>}</div>
   <div className="border-t p-4 space-y-3">
    <select value={customerId} onChange={e=>setCustomerId(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm"><option value="">Macaamiil: Lacag caddaan ah</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxEnabled} onChange={e=>setTaxEnabled(e.target.checked)}/> Canshuur ({settings.taxRate}%)</label>
    <div className="space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><b>{money(subtotal,currency)}</b></div><div className="flex justify-between"><span>Canshuur</span><b>{money(tax,currency)}</b></div><div className="flex justify-between text-lg pt-2 border-t"><span className="font-black">WADARTA</span><b className="text-teal-700">{money(total,currency)}</b></div></div>
    {customerId&&<input type="number" min="0" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="Lacagta la bixiyay" className="w-full border rounded-lg p-2.5"/>}
    <button disabled={!cart.length} onClick={()=>checkout(customerId||null,customerId?(paid||0):total)} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-black">Bixi / Lacag-bixin</button>
   </div>
  </aside>
 </div>
}

function Inventory({db,setDb,toast}){
 const blank={name:"",price:"",stock:"",category:""};
 const [form,setForm]=useState(blank),[editing,setEditing]=useState(null);
 const save=()=>{
  if(!form.name||Number(form.price)<0||Number(form.stock)<0)return;
  if(editing)setDb(d=>({...d,products:d.products.map(p=>p.id===editing?{...p,...form,price:Number(form.price),stock:Number(form.stock)}:p)}));
  else setDb(d=>({...d,products:[...d.products,{id:uid("p"),...form,price:Number(form.price),stock:Number(form.stock)}]}));
  setForm(blank);setEditing(null);toast(editing?"Alaabta waa la cusboonaysiiyay.":"Alaabta waa lagu daray.");
 };
 const edit=p=>{setEditing(p.id);setForm({name:p.name,price:p.price,stock:p.stock,category:p.category})};
 return <div className="space-y-5">
  <div className="bg-white border rounded-2xl p-5"><h2 className="font-black mb-4">{editing?"Wax ka beddel alaab":"Ku dar alaab cusub"}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Magaca alaabta" className="field"/><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Qiimaha" className="field"/><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="Stock" className="field"/><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="field"/></div><div className="flex gap-2 mt-3"><button onClick={save} className="btn-primary">{editing?"Kaydi isbeddelka":"➕ Ku dar alaab"}</button>{editing&&<button onClick={()=>{setEditing(null);setForm(blank)}} className="btn-secondary">Jooji</button>}</div></div>
  <div className="bg-white border rounded-2xl overflow-hidden"><div className="p-5 font-black">Alaabta kaydka ({db.products.length})</div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="th">Magac</th><th className="th">Category</th><th className="th">Qiime</th><th className="th">Stock</th><th className="th">Ficil</th></tr></thead><tbody>{db.products.map(p=><tr key={p.id} className="border-t"><td className="td font-semibold">{p.name}</td><td className="td">{p.category}</td><td className="td">{money(p.price,db.settings.currency)}</td><td className={`td font-bold ${p.stock<=5?"text-red-600":""}`}>{p.stock}</td><td className="td"><div className="flex gap-2"><button onClick={()=>edit(p)} className="icon-btn"><Pencil size={16}/></button><button onClick={()=>setDb(d=>({...d,products:d.products.filter(x=>x.id!==p.id)}))} className="icon-btn text-red-600"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></div>
 </div>
}

function Customers({db,setDb}){
 const [name,setName]=useState(""),[phone,setPhone]=useState("");
 const add=()=>{if(!name.trim())return;setDb(d=>({...d,customers:[...d.customers,{id:uid("c"),name,phone,paid:0,debt:0}]}));setName("");setPhone("")};
 const pay=(id)=>{const amount=Number(prompt("Geli lacagta la bixiyay:")||0);if(amount>0)setDb(d=>({...d,customers:d.customers.map(c=>c.id===id?{...c,paid:Number(c.paid||0)+amount,debt:Math.max(0,Number(c.debt||0)-amount)}:c)}))};
 return <div className="space-y-5"><div className="bg-white border rounded-2xl p-5"><h2 className="font-black mb-4">Macaamiisha & Deynta</h2><div className="grid sm:grid-cols-3 gap-3"><input className="field" value={name} onChange={e=>setName(e.target.value)} placeholder="Magaca macaamilka"/><input className="field" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Telefoon"/><button onClick={add} className="btn-primary">➕ Ku dar macaamil</button></div></div><div className="bg-white border rounded-2xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="th">Macaamil</th><th className="th">Telefoon</th><th className="th">Lacag bixiyay</th><th className="th">Deyn hadhay</th><th className="th">Ficil</th></tr></thead><tbody>{db.customers.map(c=><tr key={c.id} className="border-t"><td className="td font-semibold">{c.name}</td><td className="td">{c.phone||"-"}</td><td className="td">{money(c.paid,db.settings.currency)}</td><td className="td font-bold text-red-600">{money(c.debt,db.settings.currency)}</td><td className="td"><button onClick={()=>pay(c.id)} className="text-teal-700 font-bold">Bixi deyn</button></td></tr>)}</tbody></table>{!db.customers.length&&<Empty text="Macaamiil lama darin."/>}</div></div>
}

function Reports({sales,topProducts,currency}){
 const revenue=sales.reduce((a,s)=>a+s.total,0);
 return <div className="space-y-5"><div className="grid sm:grid-cols-3 gap-4"><Metric icon={CircleDollarSign} label="Iibka guud" value={money(revenue,currency)}/><Metric icon={Receipt} label="Tirada transactions" value={sales.length}/><Metric icon={TrendingUp} label="Alaabta ugu iibka badan" value={topProducts[0]?.p?.name||"-"}/></div><div className="bg-white border rounded-2xl p-5"><h3 className="font-black mb-4">Alaabta ugu iibka badan</h3>{topProducts.map((x,i)=><div key={x.p.id} className="flex items-center gap-3 py-3 border-b last:border-0"><span className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold">{i+1}</span><span className="flex-1 font-semibold">{x.p.name}</span><b>{x.qty} xabbo</b></div>)}{!topProducts.length&&<Empty text="Warbixin iib ah weli ma jirto."/>}</div></div>
}

function SettingsPage({db,setDb}){
 const s=db.settings;
 const update=(key,val)=>setDb(d=>({...d,settings:{...d.settings,[key]:val}}));
 return <div className="max-w-2xl bg-white border rounded-2xl p-5 space-y-5"><div><h2 className="font-black text-xl">Dejinta dukaanka</h2><p className="text-sm text-slate-500">Macluumaadkan waxaa lagu isticmaalaa risiidhka.</p></div><label className="block"><span className="label">Magaca dukaanka</span><input className="field" value={s.storeName} onChange={e=>update("storeName",e.target.value)}/></label><label className="block"><span className="label">Canshuur (%)</span><input type="number" min="0" className="field" value={s.taxRate} onChange={e=>update("taxRate",Number(e.target.value))}/></label><label className="block"><span className="label">Currency</span><input className="field" value={s.currency} onChange={e=>update("currency",e.target.value)}/></label><label className="block"><span className="label">Qoraalka hoose ee risiidhka</span><input className="field" value={s.receiptFooter} onChange={e=>update("receiptFooter",e.target.value)}/></label><button onClick={()=>{localStorage.removeItem(KEY);location.reload()}} className="text-red-600 font-bold text-sm">Tirtir dhammaan xogta browser-ka</button></div>
}

function ReceiptModal({sale,settings,close}){
 return <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"><div className="p-4 border-b flex justify-between items-center no-print"><b>Risiidhka iibka</b><button onClick={close}><X/></button></div><div id="receipt" className="receipt p-6 font-mono text-sm"><div className="text-center font-bold">{settings.storeName}<br/>RISIIDHKA IIBKA</div><div className="my-3 border-t border-dashed"/><div className="grid grid-cols-[1fr_40px_70px] gap-2 font-bold"><span>Alaab</span><span>Qty</span><span className="text-right">Qiime</span></div>{sale.items.map(i=><div key={i.id} className="grid grid-cols-[1fr_40px_70px] gap-2 mt-2"><span>{i.name}</span><span>{i.qty}</span><span className="text-right">{money(i.qty*i.price,settings.currency)}</span></div>)}<div className="my-3 border-t border-dashed"/><div className="flex justify-between"><span>Subtotal</span><b>{money(sale.subtotal,settings.currency)}</b></div><div className="flex justify-between"><span>Canshuur</span><b>{money(sale.tax,settings.currency)}</b></div><div className="flex justify-between text-base mt-2"><span>WADARTA</span><b>{money(sale.total,settings.currency)}</b></div><div className="my-3 border-t border-dashed"/><div className="text-center">{settings.receiptFooter}</div></div><div className="p-4 bg-slate-50 flex gap-2 no-print"><button onClick={()=>window.print()} className="btn-primary flex-1"><Printer size={17}/> Daabac risiidh</button><button onClick={close} className="btn-secondary">Xir</button></div></div></div>
}
function Empty({text}){return <div className="py-10 text-center text-slate-400 text-sm">{text}</div>}

createRoot(document.getElementById("root")).render(<App/>);
