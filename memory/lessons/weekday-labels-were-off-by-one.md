# Weekday labels were off by one (fixed 2026-07)

Every date label on the site (eyebrows + index day cards) carried a weekday one day
earlier than the real 2027 calendar: Apr 30, 2027 is a **Friday**, not Thursday.
The flight logistics on day 21 (LIM→MAD Thu night → Madrid Friday pm → Wizz 20:50 →
Cluj ~01:30 Sat May 22) were computed with the *real* weekdays, so only the labels
were wrong — but two day-plans silently depended on the wrong weekdays:

- **Day 4 "Pisac Sunday market"** — day 4 is Monday May 3. The real Sunday (May 2)
  is the day-3 arrival leg, which passes Chinchero (also a Sunday-market town) at
  10:00. Fixed: day 4 reframed as the daily market; day 3 Chinchero stop now notes
  the Sunday-market browse.
- **Day 19 Huaca Pucllana floodlit night visit** — night circuits run Wed–Sun; day 19
  is Tuesday. Fixed: moved to day 20 (Wednesday) before the farewell dinner.

Lesson: when editing dates or scheduling weekday-gated activities (markets, museum
closing days, night visits), verify weekdays against the actual calendar
(`date -d 2027-05-XX +%A`) and re-check every activity whose feasibility depends on
the day of week. Trip weekday map: Apr 30 Fri … May 20 Thu.
