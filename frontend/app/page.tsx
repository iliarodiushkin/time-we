"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/feed" : "/login");
  }, [router]);

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#F8F7FF" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #6C5CE7", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
