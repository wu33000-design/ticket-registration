import { FormEvent, useMemo, useState } from "react";
import { Check, ChevronRight, LockKeyhole, Minus, Plus, RotateCcw, Ticket, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type EventItem = {
  id: number;
  slug: string;
  label: string;
  dateLabel: string;
  capacity: number;
  booked: number;
};

type Receipt = {
  eventLabel: string;
  dateLabel: string;
  name: string;
  people: number;
  remaining: number;
};

const FALLBACK_EVENTS: EventItem[] = [
  { id: 1, slug: "9-21", label: "9/21", dateLabel: "9 月 21 日｜第一場", capacity: 10, booked: 0 },
  { id: 2, slug: "9-22A", label: "9/22 A", dateLabel: "9 月 22 日｜A 場", capacity: 10, booked: 0 },
  { id: 3, slug: "9-22B", label: "9/22 B", dateLabel: "9 月 22 日｜B 場", capacity: 10, booked: 0 },
];

export default function Home() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("9-21");
  const [name, setName] = useState("");
  const [people, setPeople] = useState(1);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [wrongCode, setWrongCode] = useState(false);

  const verify = trpc.access.verify.useMutation();
  const eventsQuery = trpc.events.list.useQuery(undefined, { enabled: unlocked, refetchInterval: unlocked ? 15000 : false });
  const create = trpc.registrations.create.useMutation({
    onSuccess: result => {
      setReceipt(result);
      setName("");
      setPeople(1);
      toast.success("登記完成，名額已保留");
      void eventsQuery.refetch();
    },
    onError: error => toast.error(error.message),
  });

  const eventList = (eventsQuery.data as EventItem[] | undefined) ?? FALLBACK_EVENTS;
  const selected = useMemo(() => eventList.find(event => event.slug === selectedSlug) ?? eventList[0], [eventList, selectedSlug]);
  const remaining = selected ? selected.capacity - selected.booked : 0;

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault();
    setWrongCode(false);
    const result = await verify.mutateAsync({ code });
    if (result.verified) {
      setUnlocked(true);
      return;
    }
    setWrongCode(true);
  };

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || remaining < people) return;
    create.mutate({ eventSlug: selected.slug, name, people });
  };

  if (!unlocked) {
    return (
      <main className="gate-page">
        <div className="grain" />
        <section className="gate-card">
          <div className="eyebrow"><LockKeyhole size={14} /> PRIVATE REGISTRATION</div>
          <div className="gate-mark"><Ticket size={28} strokeWidth={1.6} /></div>
          <p className="kicker">鍘美搶票大行動</p>
          <h1>先進場，<br /><em>再搶位。</em></h1>
          <p className="gate-copy">這是一個限額活動登記頁面。請輸入主辦方提供的驗證碼，進入後即可選擇場次並完成登記。</p>
          <form onSubmit={handleUnlock} className="code-form">
            <label htmlFor="access-code">驗證碼</label>
            <div className={`code-input-wrap ${wrongCode ? "is-wrong" : ""}`}>
              <input id="access-code" autoFocus value={code} onChange={event => setCode(event.target.value)} placeholder="輸入驗證碼" autoComplete="off" />
              <button type="submit" aria-label="驗證並進入" disabled={!code.trim() || verify.isPending}><ChevronRight size={22} /></button>
            </div>
            <p className={`form-hint ${wrongCode ? "error" : ""}`}>{wrongCode ? "驗證碼不正確，請再試一次。" : "驗證碼區分字元，請完整輸入。"}</p>
          </form>
          <div className="gate-footer"><span>3 場活動</span><span className="dot" /><span>每場 10 個名額</span></div>
        </section>
        <aside className="gate-side"><span>9.21 — 9.22</span><strong>LIMITED<br />SEATS</strong><span>登記開放中</span></aside>
      </main>
    );
  }

  if (receipt) {
    return (
      <main className="app-page">
        <div className="grain" />
        <header className="topbar"><div className="brand"><span className="brand-icon"><Ticket size={18} /></span><span>鍘美搶票大行動</span></div><span className="status-pill"><i /> REGISTRATION OPEN</span></header>
        <section className="success-shell">
          <div className="success-orbit"><Check size={34} /></div>
          <p className="kicker">登記已完成</p>
          <h1>名額，為你<br /><em>留好了。</em></h1>
          <div className="receipt-card">
            <div className="receipt-top"><span>REGISTRATION RECEIPT</span><span>#{receipt.eventLabel.replace(/[^0-9A-Za-z]/g, "")}</span></div>
            <div className="receipt-main"><div><small>活動場次</small><strong>{receipt.eventLabel}</strong><span>{receipt.dateLabel}</span></div><div className="receipt-people"><small>登記人數</small><strong>{String(receipt.people).padStart(2, "0")} <small>人</small></strong></div></div>
            <div className="receipt-line" />
            <div className="receipt-name"><small>登記姓名</small><span>{receipt.name}</span><small>剩餘名額 {receipt.remaining} 位</small></div>
          </div>
          <p className="success-note">請截圖保存此頁，活動當日出示登記姓名即可。</p>
          <button className="text-button" onClick={() => setReceipt(null)}><RotateCcw size={15} /> 再登記一場</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page">
      <div className="grain" />
      <header className="topbar"><div className="brand"><span className="brand-icon"><Ticket size={18} /></span><span>鍘美搶票大行動</span></div><span className="status-pill"><i /> REGISTRATION OPEN</span></header>
      <section className="hero"><div><p className="eyebrow">SEPTEMBER / LIMITED REGISTRATION</p><h1>選一場，<br /><em>把位子留下。</em></h1></div><div className="hero-note"><span>01</span><p>三場活動<br />每場限額 10 人</p></div></section>
      <div className="content-grid">
        <section className="events-panel"><div className="section-heading"><div><span className="section-index">01 / SELECT</span><h2>選擇活動場次</h2></div><span className="live-count">即時名額</span></div>
          <div className="event-list">{eventList.map((event, index) => { const spots = event.capacity - event.booked; const isSelected = selected?.slug === event.slug; return <button key={event.slug} className={`event-card ${isSelected ? "selected" : ""}`} onClick={() => { setSelectedSlug(event.slug); setPeople(Math.min(people, Math.max(spots, 1))); }}><span className="event-number">0{index + 1}</span><span className="event-info"><strong>{event.label}</strong><span>{event.dateLabel}</span></span><span className={`spots ${spots === 0 ? "sold-out" : ""}`}><b>{spots}</b> / {event.capacity}<small>{spots === 0 ? "已額滿" : "剩餘"}</small></span><ChevronRight className="event-arrow" size={18} /></button>; })}</div>
          <div className="capacity-note"><Users size={15} /> 名額會隨登記即時更新，額滿後將無法選取人數。</div>
        </section>
        <section className="form-panel"><div className="section-heading"><div><span className="section-index">02 / DETAILS</span><h2>填寫登記資料</h2></div><span className="selected-tag">{selected?.label}</span></div>
          <form onSubmit={handleRegister} className="register-form"><div className="field"><label htmlFor="name">你的名字 <span>*</span></label><input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="請輸入姓名" required maxLength={120} /></div><div className="field"><label htmlFor="people">登記人數 <span>*</span></label><div className="stepper"><button type="button" aria-label="減少人數" onClick={() => setPeople(value => Math.max(1, value - 1))}><Minus size={17} /></button><output>{String(people).padStart(2, "0")} <small>人</small></output><button type="button" aria-label="增加人數" disabled={people >= Math.min(10, remaining)} onClick={() => setPeople(value => Math.min(10, remaining, value + 1))}><Plus size={17} /></button></div></div><div className="summary-row"><span>已選場次</span><strong>{selected?.dateLabel}</strong></div><div className="summary-row"><span>送出後剩餘</span><strong>{Math.max(0, remaining - people)} 個名額</strong></div><button className="submit-button" type="submit" disabled={create.isPending || !selected || remaining < people || !name.trim()}>{create.isPending ? "處理中…" : remaining === 0 ? "此場已額滿" : "確認登記"}<ChevronRight size={19} /></button><p className="privacy-note">送出即代表你確認登記資料正確。每筆登記會即時保留名額。</p></form>
        </section>
      </div>
      <footer className="page-footer"><span>鍘美搶票大行動 / 2026</span><span>請準時出席・名額有限</span></footer>
    </main>
  );
}
