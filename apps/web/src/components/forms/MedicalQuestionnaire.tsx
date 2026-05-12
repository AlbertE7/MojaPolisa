'use client'

import { useState } from 'react'

export interface MedicalAnswers {
  height_cm?: number
  weight_kg?: number
  weight_change?: 'none' | 'gain' | 'loss'
  weight_change_kg?: number
  weight_change_diet?: boolean
  hazardous_work?: boolean
  hazardous_work_desc?: string
  risky_sports?: boolean
  risky_sports_desc?: string
  alcohol?: boolean
  alcohol_beer?: number
  alcohol_wine?: number
  alcohol_spirits?: number
  smoking_year?: boolean
  drugs?: boolean
  drugs_desc?: string
  hospital_10y?: boolean
  hospital_10y_desc?: string
  abnormal_labs?: boolean
  abnormal_labs_desc?: string
  specialist_tests?: boolean
  specialist_tests_desc?: string
  long_meds?: boolean
  long_meds_desc?: string
  // Q12 conditions
  cond_cancer?: boolean
  cond_cancer_desc?: string
  cond_cardio?: boolean
  cond_cardio_desc?: string
  cond_respiratory?: boolean
  cond_respiratory_desc?: string
  cond_digestive?: boolean
  cond_digestive_desc?: string
  cond_urinary?: boolean
  cond_urinary_desc?: string
  cond_metabolic?: boolean
  cond_metabolic_desc?: string
  cond_infectious?: boolean
  cond_infectious_desc?: string
  cond_hiv?: boolean
  cond_hiv_desc?: string
  cond_neuro?: boolean
  cond_neuro_desc?: string
  cond_musculo?: boolean
  cond_musculo_desc?: string
  cond_eyes_ears?: boolean
  cond_eyes_ears_desc?: string
  cond_other?: boolean
  cond_other_desc?: string
  // Q13-17
  sick_leave_14d?: boolean
  sick_leave_desc?: string
  disability_pension?: boolean
  disability_pension_desc?: string
  family_history?: boolean
  family_history_desc?: string
  refused_life_insurance?: boolean
  refused_desc?: string
  family_doctor?: string
  // Confirmation
  truthful_declaration?: boolean
}

interface Props {
  onSubmit: (answers: MedicalAnswers) => void
  initialHeight?: number
  initialWeight?: number
}

export function MedicalQuestionnaire({ onSubmit, initialHeight = 178, initialWeight = 78 }: Props) {
  const [a, setA] = useState<MedicalAnswers>({ height_cm: initialHeight, weight_kg: initialWeight })
  function set<K extends keyof MedicalAnswers>(k: K, v: MedicalAnswers[K]) {
    setA((s) => ({ ...s, [k]: v }))
  }

  const canSubmit = a.height_cm && a.weight_kg && a.truthful_declaration && a.family_doctor

  return (
    <div className="space-y-4">
      <div className="card bg-red-50 border-red-200">
        <h2 className="text-xl font-bold text-red-800 mb-2">Ankieta zdrowotna</h2>
        <p className="text-sm text-red-900 leading-relaxed">
          <strong>Proszę odpowiedzieć zgodnie z prawdą.</strong> Podanie nieprawdziwych informacji
          może skutkować odmową wypłaty świadczenia.
        </p>
      </div>

      {/* Q1 */}
      <MQ n={1} title="Aktualne wymiary">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Wzrost (cm)</label><input type="number" min={140} max={220} className="input-field" value={a.height_cm ?? ''} onChange={(e) => set('height_cm', e.target.valueAsNumber)} /></div>
          <div><label className="label">Waga (kg)</label><input type="number" min={40} max={250} className="input-field" value={a.weight_kg ?? ''} onChange={(e) => set('weight_kg', e.target.valueAsNumber)} /></div>
        </div>
      </MQ>

      {/* Q2 */}
      <MQ n={2} title="Czy w ostatnim roku nastąpiła zmiana wagi?">
        <YesNo value={a.weight_change && a.weight_change !== 'none'} onChange={(v) => set('weight_change', v ? 'gain' : 'none')} />
        {a.weight_change && a.weight_change !== 'none' && (
          <Expand>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => set('weight_change', 'gain')} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${a.weight_change === 'gain' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Wzrost wagi</button>
              <button type="button" onClick={() => set('weight_change', 'loss')} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${a.weight_change === 'loss' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Spadek wagi</button>
            </div>
            <label className="label">O ile kg?</label>
            <input type="number" className="input-field mb-3" value={a.weight_change_kg ?? ''} onChange={(e) => set('weight_change_kg', e.target.valueAsNumber)} />
            <p className="text-sm font-medium mb-2">Czy zmiana była skutkiem diety odchudzającej?</p>
            <YesNo value={a.weight_change_diet} onChange={(v) => set('weight_change_diet', v)} />
          </Expand>
        )}
      </MQ>

      {/* Q3 */}
      <MQ n={3} title="Czy w pracy zawodowej występują czynniki szkodliwe lub niebezpieczne?" hint="Broń palna, materiały wybuchowe, praca na wysokości >5m, praca pod ziemią, nurkowanie, wysokie napięcie, pyły, hałas, wibracje, siły specjalne, lotnictwo. Lub praca na terenach wojennych/zagrożonych.">
        <YesNo value={a.hazardous_work} onChange={(v) => set('hazardous_work', v)} />
        {a.hazardous_work && <Expand><textarea className="input-field" rows={2} placeholder="Wypisz czynniki szkodliwe" value={a.hazardous_work_desc ?? ''} onChange={(e) => set('hazardous_work_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q4 */}
      <MQ n={4} title="Czy uprawia Pan/Pani sporty ekstremalne?" hint="Sporty motorowe/motorowodne, narciarstwo wodne, windsurfing, surfing, kitesurfing, nurkowanie ze sprzętem, rafting, baloniarstwo, bungee, paralotniarstwo, spadochroniarstwo, szybownictwo, downhill, base jumping, speleologia, wspinaczka wysokogórska/skałkowa, zorbing, sporty walki, wyścigi, regaty.">
        <YesNo value={a.risky_sports} onChange={(v) => set('risky_sports', v)} />
        {a.risky_sports && <Expand><textarea className="input-field" rows={2} placeholder="Jaki sport, od kiedy, jak często" value={a.risky_sports_desc ?? ''} onChange={(e) => set('risky_sports_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q5 */}
      <MQ n={5} title="Czy pije Pan/Pani alkohol?">
        <YesNo value={a.alcohol} onChange={(v) => set('alcohol', v)} />
        {a.alcohol && (
          <Expand>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="label text-xs">Piwo (l/mies.)</label><input type="number" className="input-field" value={a.alcohol_beer ?? ''} onChange={(e) => set('alcohol_beer', e.target.valueAsNumber)} /></div>
              <div><label className="label text-xs">Wino (l/mies.)</label><input type="number" className="input-field" value={a.alcohol_wine ?? ''} onChange={(e) => set('alcohol_wine', e.target.valueAsNumber)} /></div>
              <div><label className="label text-xs">Wysokoproc. (l/mies.)</label><input type="number" className="input-field" value={a.alcohol_spirits ?? ''} onChange={(e) => set('alcohol_spirits', e.target.valueAsNumber)} /></div>
            </div>
          </Expand>
        )}
      </MQ>

      {/* Q6 */}
      <MQ n={6} title="Czy w ciągu ostatniego roku palił(a) Pan/Pani papierosy lub zażywał(a) inne produkty zawierające nikotynę?">
        <YesNo value={a.smoking_year} onChange={(v) => set('smoking_year', v)} />
      </MQ>

      {/* Q7 */}
      <MQ n={7} title="Czy teraz lub w przeszłości przyjmował(a) Pan/Pani narkotyki, środki odurzające lub nadużywał(a) alkoholu?">
        <YesNo value={a.drugs} onChange={(v) => set('drugs', v)} />
        {a.drugs && <Expand><textarea className="input-field" rows={2} placeholder="Jakie, jak długo, kiedy ostatnio" value={a.drugs_desc ?? ''} onChange={(e) => set('drugs_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q8 */}
      <MQ n={8} title="Czy w ciągu ostatnich 10 lat był(a) Pan/Pani leczony(a) w szpitalu lub operowany(a)?" hint="Nie dotyczy: skręcenia, zwichnięcia, złamania kończyn w wyniku wypadku, usunięcia migdałków, wyrostka, ciąży lub porodu.">
        <YesNo value={a.hospital_10y} onChange={(v) => set('hospital_10y', v)} />
        {a.hospital_10y && <Expand><textarea className="input-field" rows={3} placeholder="Liczba pobytów, daty, przyczyny. Dołącz kopie kart leczenia szpitalnego i wyniki histopatologiczne." value={a.hospital_10y_desc ?? ''} onChange={(e) => set('hospital_10y_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q9 */}
      <MQ n={9} title="Czy był(a) Pan/Pani poddany(a) badaniom laboratoryjnym w ostatnich 10 latach, których wyniki były nieprawidłowe i wymagały dalszej diagnostyki?">
        <YesNo value={a.abnormal_labs} onChange={(v) => set('abnormal_labs', v)} />
        {a.abnormal_labs && <Expand><textarea className="input-field" rows={2} placeholder="Kiedy, z jakiego powodu, zalecenia lekarza" value={a.abnormal_labs_desc ?? ''} onChange={(e) => set('abnormal_labs_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q10 */}
      <MQ n={10} title="Czy w wyniku badań specjalistycznych w ciągu ostatnich 10 lat skierowano Pana/Panią na dalszą diagnostykę lub leczenie?" hint="MRI, TK, kolonoskopia, endoskopia, angiografia, biopsja, mammografia, RTG, USG, EKG.">
        <YesNo value={a.specialist_tests} onChange={(v) => set('specialist_tests', v)} />
        {a.specialist_tests && <Expand><textarea className="input-field" rows={2} placeholder="Prześlij kopie wyników badań (możesz dosłać agentowi)" value={a.specialist_tests_desc ?? ''} onChange={(e) => set('specialist_tests_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q11 */}
      <MQ n={11} title="Czy aktualnie lub w ciągu ostatnich 10 lat przyjmuje Pan/Pani leki przez okres dłuższy niż 14 dni? (nie dotyczy suplementów)">
        <YesNo value={a.long_meds} onChange={(v) => set('long_meds', v)} />
        {a.long_meds && <Expand><textarea className="input-field" rows={3} placeholder="Od kiedy, jak długo, z jakiego powodu, nazwy leków, dawkowanie" value={a.long_meds_desc ?? ''} onChange={(e) => set('long_meds_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q12 - choroby */}
      <div className="card">
        <div className="flex gap-3 mb-3">
          <span className="text-brand-600 font-bold text-lg">12.</span>
          <h2 className="font-semibold text-gray-900 flex-1">Czy w ciągu ostatnich 10 lat wystąpiły u Pana/Pani poniższe dolegliwości lub choroby?</h2>
        </div>
        <div className="ml-8 space-y-3">
          <CondGroup label="Choroby nowotworowe (łagodne, złośliwe)" value={a.cond_cancer} desc={a.cond_cancer_desc} onValue={(v) => set('cond_cancer', v)} onDesc={(v) => set('cond_cancer_desc', v)} />
          <CondGroup label="Choroby układu krążenia" hint="Bóle w klatce, zaburzenia rytmu, choroba niedokrwienna, zawał, nadciśnienie (*), wada serca, niewydolność krążenia, udar mózgu." note="* Nadciśnienie – dodatkowa ankieta na email" value={a.cond_cardio} desc={a.cond_cardio_desc} onValue={(v) => set('cond_cardio', v)} onDesc={(v) => set('cond_cardio_desc', v)} />
          <CondGroup label="Choroby układu oddechowego" hint="Przewlekła chrypka, duszność, astma (*), zapalenie oskrzeli, rozedma (**), zapalenie płuc (**), gruźlica (**)." note="* Astma / ** Choroby płuc – dodatkowe ankiety na email" value={a.cond_respiratory} desc={a.cond_respiratory_desc} onValue={(v) => set('cond_respiratory', v)} onDesc={(v) => set('cond_respiratory_desc', v)} />
          <CondGroup label="Choroby przewodu pokarmowego" hint="Nawracające bóle brzucha, wrzody, choroby wątroby/pęcherzyka/trzustki/jelit, zaburzenia wchłaniania." value={a.cond_digestive} desc={a.cond_digestive_desc} onValue={(v) => set('cond_digestive', v)} onDesc={(v) => set('cond_digestive_desc', v)} />
          <CondGroup label="Choroby układu moczowego lub płciowego" hint="Zapalenie nerek (*), kamica moczowa (*), zakażenia układu moczowego (*), patologie narządu rodnego, patologie sutka." note="* Choroby nerek – dodatkowa ankieta na email" value={a.cond_urinary} desc={a.cond_urinary_desc} onValue={(v) => set('cond_urinary', v)} onDesc={(v) => set('cond_urinary_desc', v)} />
          <CondGroup label="Zaburzenia hormonalne i metaboliczne" hint="Podwyższony cukier/cholesterol/trójglicerydy, cukrzyca (*), dna moczanowa, choroby tarczycy (**)." note="* Cukrzyca / ** Tarczyca – dodatkowe ankiety na email" value={a.cond_metabolic} desc={a.cond_metabolic_desc} onValue={(v) => set('cond_metabolic', v)} onDesc={(v) => set('cond_metabolic_desc', v)} />
          <CondGroup label="Choroby zakaźne" hint="WZW (*), choroby odzwierzęce, choroby przenoszone drogą płciową." note="* WZW – dodatkowa ankieta na email" value={a.cond_infectious} desc={a.cond_infectious_desc} onValue={(v) => set('cond_infectious', v)} onDesc={(v) => set('cond_infectious_desc', v)} />
          <CondGroup label="AIDS / HIV" value={a.cond_hiv} desc={a.cond_hiv_desc} onValue={(v) => set('cond_hiv', v)} onDesc={(v) => set('cond_hiv_desc', v)} />
          <CondGroup label="Choroby układu nerwowego" hint="Omdlenia, utraty przytomności, padaczka (*), niedowłady, SM (**), porażenia, zaburzenia psychiczne (***), nerwica (****), depresja (*****)." note="* Padaczka / ** SM / *** zab. psych. / **** nerwica / ***** depresja – dodatkowe ankiety na email" value={a.cond_neuro} desc={a.cond_neuro_desc} onValue={(v) => set('cond_neuro', v)} onDesc={(v) => set('cond_neuro_desc', v)} />
          <CondGroup label="Choroby układu kostno-mięśniowego" hint="Dyskopatie (*), zwyrodnienia, choroby stawowe i mięśniowe, choroby kręgosłupa (**)." note="* Układ kostno-mięśniowy / ** Kręgosłup – dodatkowe ankiety na email" value={a.cond_musculo} desc={a.cond_musculo_desc} onValue={(v) => set('cond_musculo', v)} onDesc={(v) => set('cond_musculo_desc', v)} />
          <CondGroup label="Choroby oczu, uszu, zaburzenia wzroku lub słuchu" value={a.cond_eyes_ears} desc={a.cond_eyes_ears_desc} onValue={(v) => set('cond_eyes_ears', v)} onDesc={(v) => set('cond_eyes_ears_desc', v)} />
          <CondGroup label="Inne choroby / schorzenia / dolegliwości" value={a.cond_other} desc={a.cond_other_desc} onValue={(v) => set('cond_other', v)} onDesc={(v) => set('cond_other_desc', v)} />
        </div>
      </div>

      {/* Q13 */}
      <MQ n={13} title="Czy aktualnie lub w ciągu ostatnich 5 lat przebywał(a) Pan/Pani na zwolnieniu lekarskim dłużej niż 14 kolejnych dni?" hint="Nie dotyczy urazów kończyn, migdałków, wyrostka, ciąży, zwolnień na osoby trzecie.">
        <YesNo value={a.sick_leave_14d} onChange={(v) => set('sick_leave_14d', v)} />
        {a.sick_leave_14d && <Expand><textarea className="input-field" rows={2} placeholder="Liczba zwolnień, przyczyny, czas trwania" value={a.sick_leave_desc ?? ''} onChange={(e) => set('sick_leave_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q14 */}
      <MQ n={14} title="Czy kiedykolwiek ubiegał(a) się lub otrzymał(a) Pan/Pani rentę chorobową/inwalidzką, świadczenie rehabilitacyjne, zasiłek pielęgnacyjny lub stopień niepełnosprawności?">
        <YesNo value={a.disability_pension} onChange={(v) => set('disability_pension', v)} />
        {a.disability_pension && <Expand><textarea className="input-field" rows={2} placeholder="Okres, przyczyna, grupa/stopień niezdolności" value={a.disability_pension_desc ?? ''} onChange={(e) => set('disability_pension_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q15 */}
      <MQ n={15} title="Czy ktoś z najbliższej rodziny (rodzice, rodzeństwo) chorował lub zmarł przed 65. rokiem życia?" hint="Z powodu: nowotworu, chorób serca/krążenia, cukrzycy, zaburzeń psychicznych, chorób wrodzonych lub dziedzicznych.">
        <YesNo value={a.family_history} onChange={(v) => set('family_history', v)} />
        {a.family_history && <Expand><textarea className="input-field" rows={2} placeholder="Pokrewieństwo, rodzaj schorzenia, wiek rozpoznania, wiek śmierci" value={a.family_history_desc ?? ''} onChange={(e) => set('family_history_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q16 */}
      <MQ n={16} title="Czy kiedykolwiek odmówiono Panu/Pani zawarcia umowy ubezpieczenia na życie?">
        <YesNo value={a.refused_life_insurance} onChange={(v) => set('refused_life_insurance', v)} />
        {a.refused_life_insurance && <Expand><textarea className="input-field" rows={2} placeholder="Z jakiego powodu" value={a.refused_desc ?? ''} onChange={(e) => set('refused_desc', e.target.value)} /></Expand>}
      </MQ>

      {/* Q17 */}
      <MQ n={17} title="Proszę podać informacje o placówce medycznej i lekarzu pierwszego kontaktu lub lekarzu rodzinnym">
        <input type="text" className="input-field" placeholder="np. NFZ – lekarz rodzinny / nazwa przychodni" value={a.family_doctor ?? ''} onChange={(e) => set('family_doctor', e.target.value)} />
      </MQ>

      {/* Truthful declaration */}
      <div className="card border-l-4 border-l-red-500">
        <label className="flex gap-3 items-start cursor-pointer">
          <input type="checkbox" checked={a.truthful_declaration === true} onChange={(e) => set('truthful_declaration', e.target.checked)} className="mt-1 accent-brand-600 w-5 h-5" />
          <span className="text-sm font-medium text-gray-800">
            Oświadczam, że wszystkie powyższe informacje są zgodne z prawdą i jestem świadomy(a)
            skutków podania nieprawdziwych danych (m.in. odmowy wypłaty świadczenia).
          </span>
        </label>
      </div>

      <button type="button" onClick={() => canSubmit && onSubmit(a)} disabled={!canSubmit} className="btn-primary w-full text-lg py-4">
        Zapisz ankietę medyczną →
      </button>
    </div>
  )
}

function MQ({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="flex gap-3 mb-2">
        <span className="text-brand-600 font-bold text-lg">{n}.</span>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
      </div>
      <div className="ml-8 mt-3">{children}</div>
    </div>
  )
}

function CondGroup({ label, hint, note, value, desc, onValue, onDesc }: { label: string; hint?: string; note?: string; value?: boolean; desc?: string; onValue: (v: boolean) => void; onDesc: (v: string) => void }) {
  return (
    <div className="border-l-2 border-gray-100 pl-3">
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={value === true} onChange={(e) => onValue(e.target.checked)} className="mt-1 accent-brand-600 w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{label}</div>
          {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
          {note && <div className="text-xs text-orange-600 mt-0.5 italic">{note}</div>}
        </div>
      </div>
      {value && (
        <div className="mt-2 ml-8 animate-fade-in">
          <textarea className="input-field" rows={2} placeholder="Opisz: rodzaj, rozpoznanie, daty, leczenie" value={desc ?? ''} onChange={(e) => onDesc(e.target.value)} />
        </div>
      )}
    </div>
  )
}

function YesNo({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange(true)} className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm ${value === true ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Tak</button>
      <button type="button" onClick={() => onChange(false)} className={`flex-1 py-2 rounded-lg border-2 font-semibold text-sm ${value === false ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-600'}`}>Nie</button>
    </div>
  )
}

function Expand({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 p-3 bg-brand-50/50 rounded-lg border border-brand-100 animate-fade-in">{children}</div>
}
