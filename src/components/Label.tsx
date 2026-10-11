"use client";

import { useLang } from "@/lib/LangContext";

export default function Label() {
  const { t } = useLang();
  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="wrap label-grid">
        <div>
          <p className="eyebrow">{t.nEy}</p>
          <h2 className="h2">{t.nH}</h2>
          <div className="points">
            {t.points.map(([n, d]) => (
              <div key={n}>
                <b>{n}</b>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="nutri">
          <h3>{t.tH}</h3>
          <p className="per">{t.tPer}</p>
          <table>
            <tbody>
              {t.rows.map(([k, v, cls]) => (
                <tr key={k} className={cls || undefined}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="ing">{t.tIng}</p>
        </div>
      </div>
    </section>
  );
}
