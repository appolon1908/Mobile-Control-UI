import React,{useEffect,useState} from "react";
import{createRoot}from"react-dom/client";
import{Activity,Audit,ChevronRight,RefreshCw,Search,ShieldCheck,Smartphone,Users}from"lucide-react";
import"./style.css";

type Device={id:string;platform:string;status:string;model?:string;os_version?:string;last_seen?:string};
const API=(import.meta as any).env?.VITE_MOBILE_API_URL||"http://localhost:8000";

function App(){
 const[devices,setDevices]=useState<Device[]>([]),[selected,setSelected]=useState<Device|null>(null),[error,setError]=useState("");
 const load=async()=>{try{setError("");const r=await fetch(API+"/v1/devices");if(!r.ok)throw new Error("API "+r.status);const j=await r.json();setDevices(j.items||[]);if(!selected&&j.items?.length)setSelected(j.items[0])}catch(e:any){setError(e.message)}};
 useEffect(()=>{load()},[]);
 const command=async(type:string)=>{if(!selected)return;await fetch(API+"/v1/devices/"+selected.id+"/commands",{method:"POST",headers:{"content-type":"application/json","x-actor":"mobile-control-ui"},body:JSON.stringify({type,idempotency_key:crypto.randomUUID(),payload:{}})});};
 return <div className="shell">
  <aside><div className="brand"><ShieldCheck/> <b>Codestra</b></div><small>MOBILE CONTROL</small>
   <nav><button className="active"><Smartphone/>Devices</button><button><Activity/>Commands</button><button><Users/>Sync</button><button><Audit/>Audit</button></nav>
   <div className="secure"><ShieldCheck/><div><b>Authorized fleet</b><span>Policy-controlled devices only</span></div></div>
  </aside>
  <main><header><div><h1>Device Operations</h1><p>Manage enrolled devices, policy and verified command execution.</p></div><button className="refresh" onClick={load}><RefreshCw/>Refresh</button></header>
   <section className="stats"><article><span>Enrolled devices</span><strong>{devices.length}</strong></article><article><span>Active</span><strong>{devices.filter(x=>x.status==="active").length}</strong></article><article><span>Attention</span><strong>{devices.filter(x=>x.status!=="active").length}</strong></article></section>
   <div className="workspace"><section className="panel list"><div className="panelhead"><h2>Fleet</h2><label><Search/><input placeholder="Search devices"/></label></div>
    {error&&<div className="error">Control Server unavailable: {error}</div>}
    {devices.length===0&&!error&&<div className="empty">No enrolled devices yet.</div>}
    {devices.map(d=><button key={d.id} className={"device "+(selected?.id===d.id?"selected":"")} onClick={()=>setSelected(d)}><div className="phone"><Smartphone/></div><div><b>{d.model||"Android device"}</b><span>{d.id.slice(0,12)} · {d.os_version||"Android"}</span></div><i className={d.status}/><ChevronRight/></button>)}
   </section>
   <section className="panel detail">{selected?<><div className="detailtop"><div className="phone large"><Smartphone/></div><div><h2>{selected.model||"Android device"}</h2><p>{selected.id}</p></div><span className="badge">{selected.status}</span></div>
    <div className="facts"><div><span>Platform</span><b>{selected.platform}</b></div><div><span>OS</span><b>{selected.os_version||"—"}</b></div><div><span>Last seen</span><b>{selected.last_seen||"—"}</b></div></div>
    <h3>Authorized actions</h3><div className="actions"><button onClick={()=>command("collect_inventory")}>Collect inventory</button><button onClick={()=>command("sync_contacts")}>Sync contacts</button><button onClick={()=>command("sync_media")}>Sync media</button><button onClick={()=>command("apply_policy")}>Apply policy</button></div>
    <div className="notice"><ShieldCheck/><div><b>Protected execution</b><p>Actions are sent to Control Server and require backend authorization. Completion depends on device readback.</p></div></div>
   </>:<div className="empty">Select a device to manage it.</div>}</section></div>
  </main>
 </div>
}
createRoot(document.getElementById("root")!).render(<App/>);