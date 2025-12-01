"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type RecordEntry = {
  id: string;
  plateNumber: string;
  yukBilan: number;
  yuksiz: number;
  sofVazin: number;
  date: string;
  summa: number;
  checkNumber: string;
};

type FormState = {
  plateNumber: string;
  yukBilan: string;
  yuksiz: string;
  date: string;
  summa: string;
  checkNumber: string;
};

const baseRecords: RecordEntry[] = [
  {
    id: "rec-001",
    plateNumber: "UZ 45 A123",
    yukBilan: 42000,
    yuksiz: 16000,
    sofVazin: 26000,
    date: "2024-06-15",
    summa: 30000,
    checkNumber: "CHK-9834"
  },
  {
    id: "rec-002",
    plateNumber: "KZ 90 B456",
    yukBilan: 39800,
    yuksiz: 15500,
    sofVazin: 24300,
    date: "2024-06-17",
    summa: 40000,
    checkNumber: "CHK-6542"
  },
  {
    id: "rec-003",
    plateNumber: "UZ 10 Z999",
    yukBilan: 36500,
    yuksiz: 14900,
    sofVazin: 21600,
    date: "2024-06-18",
    summa: 28000,
    checkNumber: "CHK-7741"
  }
];

const createEmptyFormState = (): FormState => ({
  plateNumber: "",
  yukBilan: "",
  yuksiz: "",
  date: new Date().toISOString().split("T")[0],
  summa: "",
  checkNumber: ""
});

export default function HomePage() {
  const [records, setRecords] = useState<RecordEntry[]>(() =>
    baseRecords.map((record) => ({ ...record }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [relayMessage, setRelayMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(() => createEmptyFormState());
  const plateInputRef = useRef<HTMLInputElement>(null);

  const computedSofVazin = useMemo(() => {
    const yukBilan = Number(formState.yukBilan) || 0;
    const yuksiz = Number(formState.yuksiz) || 0;
    const difference = yukBilan - yuksiz;
    return difference > 0 ? difference : 0;
  }, [formState.yukBilan, formState.yuksiz]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return records.map((record) => ({ record, highlighted: false }));
    }

    return records
      .filter((record) => {
        const combined = `${record.plateNumber} ${record.yukBilan} ${record.yuksiz} ${record.sofVazin} ${record.date} ${record.summa} ${record.checkNumber}`.toLowerCase();
        return combined.includes(query);
      })
      .map((record) => ({ record, highlighted: true }));
  }, [records, searchQuery]);

  const resetForm = () => {
    setFormState(createEmptyFormState());
    setEditingId(null);
    setSelectedId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPlate = formState.plateNumber.trim();
    const trimmedCheckNumber = formState.checkNumber.trim();

    if (!trimmedPlate) {
      plateInputRef.current?.focus();
      return;
    }

    const entry: RecordEntry = {
      id: editingId ?? crypto.randomUUID(),
      plateNumber: trimmedPlate,
      yukBilan: Number(formState.yukBilan) || 0,
      yuksiz: Number(formState.yuksiz) || 0,
      sofVazin: computedSofVazin,
      date: formState.date,
      summa: Number(formState.summa) || 0,
      checkNumber: trimmedCheckNumber || `CHK-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    };

    setRecords((prev) => {
      if (editingId) {
        return prev.map((record) => (record.id === editingId ? entry : record));
      }
      return [entry, ...prev];
    });

    resetForm();
  };

  const handleFieldChange = (field: keyof FormState) => (value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRowSelect = (id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  };

  const handleRowEdit = (record: RecordEntry) => {
    setEditingId(record.id);
    setSelectedId(record.id);
    setFormState({
      plateNumber: record.plateNumber,
      yukBilan: record.yukBilan.toString(),
      yuksiz: record.yuksiz.toString(),
      date: record.date,
      summa: record.summa.toString(),
      checkNumber: record.checkNumber
    });
    setRelayMessage(`Editing ${record.plateNumber}`);
    plateInputRef.current?.focus();
  };

  const handleRowDelete = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    if (editingId === id) {
      resetForm();
    }
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const handleGlobalDelete = () => {
    if (!selectedId) {
      return;
    }
    handleRowDelete(selectedId);
  };

  const handleGlobalEdit = () => {
    if (!selectedId) {
      return;
    }
    const record = records.find((entry) => entry.id === selectedId);
    if (record) {
      handleRowEdit(record);
    }
  };

  const handleGlobalAdd = () => {
    resetForm();
    setRelayMessage("Ready for a new entry.");
    requestAnimationFrame(() => {
      plateInputRef.current?.focus();
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReload = () => {
    setRecords(baseRecords.map((record) => ({ ...record })));
    resetForm();
    setSearchQuery("");
    setRelayMessage("Data reloaded from caravan log.");
  };

  const handleRelay = () => {
    setRelayMessage("Relay signal sent across the caravan route.");
    setTimeout(() => {
      setRelayMessage(null);
    }, 4500);
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.panel} ${styles.topBar}`}>
        <div className={styles.topRow}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 42c4-8 8-14 16-14s12 4 16 4 8-6 12-6 6 4 6 10-4 12-12 12H12c-4 0-6-2-4-6z"
                  fill="url(#paint0_linear)"
                />
                <path
                  d="M16 30c2.4-4.4 6.6-10 14-10 4 0 6 2 8 4 2 2 4 4 8 4 3.6 0 6.8-2.4 9.6-4.8 2.8-2.4 4.4-3.2 6.4-1.2 2.4 2.4 2 5.6-0.4 8-4 4-9.6 6-15.6 6H18c-3.2 0-4.4-2.4-2-6z"
                  fill="rgba(255,255,255,0.45)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear"
                    x1="8"
                    y1="42"
                    x2="58"
                    y2="42"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FF9D6C" />
                    <stop offset="1" stopColor="#FF4D4D" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={styles.logoTitle}>
              <h1>Caravan Weigh</h1>
              <span>CAMELS • CARGO • CONTROL</span>
            </div>
          </div>
          <div className={styles.alarm}>
            <span className={styles.alarmIndicator} />
            Active Alarm
          </div>
        </div>
        <div className={styles.topRow}>
          <label className={styles.searchBar}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 3a6 6 0 0 1 6 6c0 3.31-2.69 6-6 6-3.31 0-6-2.69-6-6 0-3.31 2.69-6 6-6z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M20 20l-3.3-3.3M9 5.5a3 3 0 0 1 4.5 2.598 3 3 0 0 1-3 3A3.5 3.5 0 0 1 9 5.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search caravan records…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.actionButton} type="button" onClick={handleGlobalAdd}>
              Add
            </button>
            <button className={styles.actionButton} type="button" onClick={handleGlobalEdit}>
              Edit
            </button>
            <button className={styles.actionButton} type="button" onClick={handleGlobalDelete}>
              Delete
            </button>
            <button className={styles.actionButton} type="button" onClick={handlePrint}>
              Print
            </button>
            <button className={styles.actionButton} type="button" onClick={handleReload}>
              Reload
            </button>
            <button className={styles.actionButton} type="button" onClick={handleRelay}>
              Relay
            </button>
          </div>
        </div>
        {relayMessage ? <div className={styles.relayBadge}>{relayMessage}</div> : null}
      </section>

      <section className={styles.panel}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="plateNumber">Plate Number</label>
              <input
                id="plateNumber"
                ref={plateInputRef}
                type="text"
                required
                value={formState.plateNumber}
                onChange={(event) => handleFieldChange("plateNumber")(event.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="yukBilan">Yuk bilan (Kg)</label>
              <input
                id="yukBilan"
                type="number"
                min="0"
                inputMode="numeric"
                value={formState.yukBilan}
                onChange={(event) => handleFieldChange("yukBilan")(event.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="yuksiz">Yuksiz (Kg)</label>
              <input
                id="yuksiz"
                type="number"
                min="0"
                inputMode="numeric"
                value={formState.yuksiz}
                onChange={(event) => handleFieldChange("yuksiz")(event.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="sofVazin">Sof Vazin (Kg)</label>
              <input
                id="sofVazin"
                type="number"
                readOnly
                value={
                  formState.yukBilan || formState.yuksiz ? computedSofVazin : ""
                }
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={formState.date}
                onChange={(event) => handleFieldChange("date")(event.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="summa">Summa</label>
              <input
                id="summa"
                type="number"
                min="0"
                inputMode="numeric"
                value={formState.summa}
                onChange={(event) => handleFieldChange("summa")(event.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="checkNumber">Add-on Check Number</label>
              <input
                id="checkNumber"
                type="text"
                value={formState.checkNumber}
                onChange={(event) => handleFieldChange("checkNumber")(event.target.value)}
              />
            </div>
          </div>
          <div className={styles.submitRow}>
            <button className={styles.submitButton} type="submit">
              {editingId ? "Save Changes" : "Add Entry"}
            </button>
            <button className={styles.resetButton} type="button" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className={`${styles.panel} ${styles.tablePanel}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Plate_Number</th>
                <th>Yuk_bilan</th>
                <th>Sana (Date)</th>
                <th>Yuksiz</th>
                <th>Sof_Vazin</th>
                <th>Price</th>
                <th>Check</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px 18px" }}>
                    No entries match the search.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(({ record, highlighted }) => {
                  const isSelected = selectedId === record.id;
                  const rowClasses = [
                    highlighted ? styles.searchMatch : "",
                    isSelected ? styles.selectedRow : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={record.id}
                      className={rowClasses || undefined}
                      onClick={() => handleRowSelect(record.id)}
                    >
                      <td>{record.plateNumber}</td>
                      <td>{record.yukBilan.toLocaleString()}</td>
                      <td>{record.date}</td>
                      <td>{record.yuksiz.toLocaleString()}</td>
                      <td>{record.sofVazin.toLocaleString()}</td>
                      <td>{record.summa.toLocaleString()}</td>
                      <td>{record.checkNumber}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.rowButton}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRowEdit(record);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.rowButton}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRowDelete(record.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
