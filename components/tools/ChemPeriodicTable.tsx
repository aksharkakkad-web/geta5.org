'use client'

import React from 'react'

type Category =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide'
  | 'unknown'

interface Elem {
  Z: number
  symbol: string
  mass: string
  group: number
  period: number
  cat: Category
}

interface FBlockElem {
  Z: number
  symbol: string
  mass: string
  cat: Category
}

const CAT_COLORS: Record<Category, string> = {
  alkali: '#f87171',
  alkaline: '#fb923c',
  transition: '#60a5fa',
  'post-transition': '#4ade80',
  metalloid: '#fbbf24',
  nonmetal: '#34d399',
  halogen: '#a3e635',
  noble: '#a78bfa',
  lanthanide: '#818cf8',
  actinide: '#f472b6',
  unknown: '#6b7280',
}

const CAT_LABELS: Record<Category, string> = {
  alkali: 'Alkali Metal',
  alkaline: 'Alkaline Earth',
  transition: 'Transition Metal',
  'post-transition': 'Post-transition',
  metalloid: 'Metalloid',
  nonmetal: 'Nonmetal',
  halogen: 'Halogen',
  noble: 'Noble Gas',
  lanthanide: 'Lanthanide',
  actinide: 'Actinide',
  unknown: 'Unknown',
}

const ELEMENTS: Elem[] = [
  // Period 1
  { Z: 1,   symbol: 'H',  mass: '1.008',  group: 1,  period: 1, cat: 'nonmetal' },
  { Z: 2,   symbol: 'He', mass: '4.003',  group: 18, period: 1, cat: 'noble' },
  // Period 2
  { Z: 3,   symbol: 'Li', mass: '6.941',  group: 1,  period: 2, cat: 'alkali' },
  { Z: 4,   symbol: 'Be', mass: '9.012',  group: 2,  period: 2, cat: 'alkaline' },
  { Z: 5,   symbol: 'B',  mass: '10.81',  group: 13, period: 2, cat: 'metalloid' },
  { Z: 6,   symbol: 'C',  mass: '12.01',  group: 14, period: 2, cat: 'nonmetal' },
  { Z: 7,   symbol: 'N',  mass: '14.01',  group: 15, period: 2, cat: 'nonmetal' },
  { Z: 8,   symbol: 'O',  mass: '16.00',  group: 16, period: 2, cat: 'nonmetal' },
  { Z: 9,   symbol: 'F',  mass: '19.00',  group: 17, period: 2, cat: 'halogen' },
  { Z: 10,  symbol: 'Ne', mass: '20.18',  group: 18, period: 2, cat: 'noble' },
  // Period 3
  { Z: 11,  symbol: 'Na', mass: '22.99',  group: 1,  period: 3, cat: 'alkali' },
  { Z: 12,  symbol: 'Mg', mass: '24.31',  group: 2,  period: 3, cat: 'alkaline' },
  { Z: 13,  symbol: 'Al', mass: '26.98',  group: 13, period: 3, cat: 'post-transition' },
  { Z: 14,  symbol: 'Si', mass: '28.09',  group: 14, period: 3, cat: 'metalloid' },
  { Z: 15,  symbol: 'P',  mass: '30.97',  group: 15, period: 3, cat: 'nonmetal' },
  { Z: 16,  symbol: 'S',  mass: '32.07',  group: 16, period: 3, cat: 'nonmetal' },
  { Z: 17,  symbol: 'Cl', mass: '35.45',  group: 17, period: 3, cat: 'halogen' },
  { Z: 18,  symbol: 'Ar', mass: '39.95',  group: 18, period: 3, cat: 'noble' },
  // Period 4
  { Z: 19,  symbol: 'K',  mass: '39.10',  group: 1,  period: 4, cat: 'alkali' },
  { Z: 20,  symbol: 'Ca', mass: '40.08',  group: 2,  period: 4, cat: 'alkaline' },
  { Z: 21,  symbol: 'Sc', mass: '44.96',  group: 3,  period: 4, cat: 'transition' },
  { Z: 22,  symbol: 'Ti', mass: '47.87',  group: 4,  period: 4, cat: 'transition' },
  { Z: 23,  symbol: 'V',  mass: '50.94',  group: 5,  period: 4, cat: 'transition' },
  { Z: 24,  symbol: 'Cr', mass: '52.00',  group: 6,  period: 4, cat: 'transition' },
  { Z: 25,  symbol: 'Mn', mass: '54.94',  group: 7,  period: 4, cat: 'transition' },
  { Z: 26,  symbol: 'Fe', mass: '55.85',  group: 8,  period: 4, cat: 'transition' },
  { Z: 27,  symbol: 'Co', mass: '58.93',  group: 9,  period: 4, cat: 'transition' },
  { Z: 28,  symbol: 'Ni', mass: '58.69',  group: 10, period: 4, cat: 'transition' },
  { Z: 29,  symbol: 'Cu', mass: '63.55',  group: 11, period: 4, cat: 'transition' },
  { Z: 30,  symbol: 'Zn', mass: '65.38',  group: 12, period: 4, cat: 'transition' },
  { Z: 31,  symbol: 'Ga', mass: '69.72',  group: 13, period: 4, cat: 'post-transition' },
  { Z: 32,  symbol: 'Ge', mass: '72.63',  group: 14, period: 4, cat: 'metalloid' },
  { Z: 33,  symbol: 'As', mass: '74.92',  group: 15, period: 4, cat: 'metalloid' },
  { Z: 34,  symbol: 'Se', mass: '78.97',  group: 16, period: 4, cat: 'nonmetal' },
  { Z: 35,  symbol: 'Br', mass: '79.90',  group: 17, period: 4, cat: 'halogen' },
  { Z: 36,  symbol: 'Kr', mass: '83.80',  group: 18, period: 4, cat: 'noble' },
  // Period 5
  { Z: 37,  symbol: 'Rb', mass: '85.47',  group: 1,  period: 5, cat: 'alkali' },
  { Z: 38,  symbol: 'Sr', mass: '87.62',  group: 2,  period: 5, cat: 'alkaline' },
  { Z: 39,  symbol: 'Y',  mass: '88.91',  group: 3,  period: 5, cat: 'transition' },
  { Z: 40,  symbol: 'Zr', mass: '91.22',  group: 4,  period: 5, cat: 'transition' },
  { Z: 41,  symbol: 'Nb', mass: '92.91',  group: 5,  period: 5, cat: 'transition' },
  { Z: 42,  symbol: 'Mo', mass: '95.96',  group: 6,  period: 5, cat: 'transition' },
  { Z: 43,  symbol: 'Tc', mass: '(98)',   group: 7,  period: 5, cat: 'transition' },
  { Z: 44,  symbol: 'Ru', mass: '101.1',  group: 8,  period: 5, cat: 'transition' },
  { Z: 45,  symbol: 'Rh', mass: '102.9',  group: 9,  period: 5, cat: 'transition' },
  { Z: 46,  symbol: 'Pd', mass: '106.4',  group: 10, period: 5, cat: 'transition' },
  { Z: 47,  symbol: 'Ag', mass: '107.9',  group: 11, period: 5, cat: 'transition' },
  { Z: 48,  symbol: 'Cd', mass: '112.4',  group: 12, period: 5, cat: 'transition' },
  { Z: 49,  symbol: 'In', mass: '114.8',  group: 13, period: 5, cat: 'post-transition' },
  { Z: 50,  symbol: 'Sn', mass: '118.7',  group: 14, period: 5, cat: 'post-transition' },
  { Z: 51,  symbol: 'Sb', mass: '121.8',  group: 15, period: 5, cat: 'metalloid' },
  { Z: 52,  symbol: 'Te', mass: '127.6',  group: 16, period: 5, cat: 'metalloid' },
  { Z: 53,  symbol: 'I',  mass: '126.9',  group: 17, period: 5, cat: 'halogen' },
  { Z: 54,  symbol: 'Xe', mass: '131.3',  group: 18, period: 5, cat: 'noble' },
  // Period 6 (La/Ac series placeholder at group 3)
  { Z: 55,  symbol: 'Cs', mass: '132.9',  group: 1,  period: 6, cat: 'alkali' },
  { Z: 56,  symbol: 'Ba', mass: '137.3',  group: 2,  period: 6, cat: 'alkaline' },
  { Z: 72,  symbol: 'Hf', mass: '178.5',  group: 4,  period: 6, cat: 'transition' },
  { Z: 73,  symbol: 'Ta', mass: '180.9',  group: 5,  period: 6, cat: 'transition' },
  { Z: 74,  symbol: 'W',  mass: '183.8',  group: 6,  period: 6, cat: 'transition' },
  { Z: 75,  symbol: 'Re', mass: '186.2',  group: 7,  period: 6, cat: 'transition' },
  { Z: 76,  symbol: 'Os', mass: '190.2',  group: 8,  period: 6, cat: 'transition' },
  { Z: 77,  symbol: 'Ir', mass: '192.2',  group: 9,  period: 6, cat: 'transition' },
  { Z: 78,  symbol: 'Pt', mass: '195.1',  group: 10, period: 6, cat: 'transition' },
  { Z: 79,  symbol: 'Au', mass: '197.0',  group: 11, period: 6, cat: 'transition' },
  { Z: 80,  symbol: 'Hg', mass: '200.6',  group: 12, period: 6, cat: 'transition' },
  { Z: 81,  symbol: 'Tl', mass: '204.4',  group: 13, period: 6, cat: 'post-transition' },
  { Z: 82,  symbol: 'Pb', mass: '207.2',  group: 14, period: 6, cat: 'post-transition' },
  { Z: 83,  symbol: 'Bi', mass: '209.0',  group: 15, period: 6, cat: 'post-transition' },
  { Z: 84,  symbol: 'Po', mass: '(209)',  group: 16, period: 6, cat: 'metalloid' },
  { Z: 85,  symbol: 'At', mass: '(210)',  group: 17, period: 6, cat: 'halogen' },
  { Z: 86,  symbol: 'Rn', mass: '(222)',  group: 18, period: 6, cat: 'noble' },
  // Period 7 (Ac series placeholder at group 3)
  { Z: 87,  symbol: 'Fr', mass: '(223)',  group: 1,  period: 7, cat: 'alkali' },
  { Z: 88,  symbol: 'Ra', mass: '(226)',  group: 2,  period: 7, cat: 'alkaline' },
  { Z: 104, symbol: 'Rf', mass: '(267)', group: 4,  period: 7, cat: 'transition' },
  { Z: 105, symbol: 'Db', mass: '(268)', group: 5,  period: 7, cat: 'transition' },
  { Z: 106, symbol: 'Sg', mass: '(271)', group: 6,  period: 7, cat: 'transition' },
  { Z: 107, symbol: 'Bh', mass: '(270)', group: 7,  period: 7, cat: 'transition' },
  { Z: 108, symbol: 'Hs', mass: '(277)', group: 8,  period: 7, cat: 'transition' },
  { Z: 109, symbol: 'Mt', mass: '(278)', group: 9,  period: 7, cat: 'unknown' },
  { Z: 110, symbol: 'Ds', mass: '(281)', group: 10, period: 7, cat: 'unknown' },
  { Z: 111, symbol: 'Rg', mass: '(282)', group: 11, period: 7, cat: 'unknown' },
  { Z: 112, symbol: 'Cn', mass: '(285)', group: 12, period: 7, cat: 'transition' },
  { Z: 113, symbol: 'Nh', mass: '(286)', group: 13, period: 7, cat: 'unknown' },
  { Z: 114, symbol: 'Fl', mass: '(289)', group: 14, period: 7, cat: 'unknown' },
  { Z: 115, symbol: 'Mc', mass: '(290)', group: 15, period: 7, cat: 'unknown' },
  { Z: 116, symbol: 'Lv', mass: '(293)', group: 16, period: 7, cat: 'unknown' },
  { Z: 117, symbol: 'Ts', mass: '(294)', group: 17, period: 7, cat: 'unknown' },
  { Z: 118, symbol: 'Og', mass: '(294)', group: 18, period: 7, cat: 'noble' },
]

// Lanthanides: La(57)–Lu(71), displayed at columns 3–17 in f-block row
const LANTHANIDES: FBlockElem[] = [
  { Z: 57,  symbol: 'La', mass: '138.9', cat: 'lanthanide' },
  { Z: 58,  symbol: 'Ce', mass: '140.1', cat: 'lanthanide' },
  { Z: 59,  symbol: 'Pr', mass: '140.9', cat: 'lanthanide' },
  { Z: 60,  symbol: 'Nd', mass: '144.2', cat: 'lanthanide' },
  { Z: 61,  symbol: 'Pm', mass: '(145)', cat: 'lanthanide' },
  { Z: 62,  symbol: 'Sm', mass: '150.4', cat: 'lanthanide' },
  { Z: 63,  symbol: 'Eu', mass: '152.0', cat: 'lanthanide' },
  { Z: 64,  symbol: 'Gd', mass: '157.3', cat: 'lanthanide' },
  { Z: 65,  symbol: 'Tb', mass: '158.9', cat: 'lanthanide' },
  { Z: 66,  symbol: 'Dy', mass: '162.5', cat: 'lanthanide' },
  { Z: 67,  symbol: 'Ho', mass: '164.9', cat: 'lanthanide' },
  { Z: 68,  symbol: 'Er', mass: '167.3', cat: 'lanthanide' },
  { Z: 69,  symbol: 'Tm', mass: '168.9', cat: 'lanthanide' },
  { Z: 70,  symbol: 'Yb', mass: '173.1', cat: 'lanthanide' },
  { Z: 71,  symbol: 'Lu', mass: '175.0', cat: 'lanthanide' },
]

// Actinides: Ac(89)–Lr(103), displayed at columns 3–17 in f-block row
const ACTINIDES: FBlockElem[] = [
  { Z: 89,  symbol: 'Ac', mass: '(227)', cat: 'actinide' },
  { Z: 90,  symbol: 'Th', mass: '232.0', cat: 'actinide' },
  { Z: 91,  symbol: 'Pa', mass: '231.0', cat: 'actinide' },
  { Z: 92,  symbol: 'U',  mass: '238.0', cat: 'actinide' },
  { Z: 93,  symbol: 'Np', mass: '(237)', cat: 'actinide' },
  { Z: 94,  symbol: 'Pu', mass: '(244)', cat: 'actinide' },
  { Z: 95,  symbol: 'Am', mass: '(243)', cat: 'actinide' },
  { Z: 96,  symbol: 'Cm', mass: '(247)', cat: 'actinide' },
  { Z: 97,  symbol: 'Bk', mass: '(247)', cat: 'actinide' },
  { Z: 98,  symbol: 'Cf', mass: '(251)', cat: 'actinide' },
  { Z: 99,  symbol: 'Es', mass: '(252)', cat: 'actinide' },
  { Z: 100, symbol: 'Fm', mass: '(257)', cat: 'actinide' },
  { Z: 101, symbol: 'Md', mass: '(258)', cat: 'actinide' },
  { Z: 102, symbol: 'No', mass: '(259)', cat: 'actinide' },
  { Z: 103, symbol: 'Lr', mass: '(266)', cat: 'actinide' },
]

const GRID_COL = 'repeat(18, minmax(42px, 1fr))'
const CELL_HEIGHT = 52
const GAP = 3

function ElemCell({ Z, symbol, mass, cat }: { Z: number; symbol: string; mass: string; cat: Category }) {
  const topColor = CAT_COLORS[cat]
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--bg-border)',
      borderTop: `3px solid ${topColor}`,
      borderRadius: '3px',
      padding: '3px 2px 3px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: `${CELL_HEIGHT}px`,
      justifyContent: 'space-between',
      overflow: 'hidden',
    }}>
      <span style={{ fontSize: '8px', color: 'var(--text-muted)', lineHeight: 1, alignSelf: 'flex-start', paddingLeft: '2px' }}>
        {Z}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {symbol}
      </span>
      <span style={{ fontSize: '7px', color: 'var(--text-muted)', lineHeight: 1, textAlign: 'center' }}>
        {mass}
      </span>
    </div>
  )
}

function PlaceholderCell({ label, cat }: { label: string; cat: Category }) {
  const topColor = CAT_COLORS[cat]
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px dashed ${topColor}`,
      borderTop: `3px solid ${topColor}`,
      borderRadius: '3px',
      height: `${CELL_HEIGHT}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '9px',
      color: topColor,
      fontWeight: 600,
      fontFamily: 'var(--font-outfit)',
      opacity: 0.7,
    }}>
      {label}
    </div>
  )
}

export default function ChemPeriodicTable() {
  return (
    <div style={{ minWidth: '810px' }}>
      {/* Group number header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: GRID_COL,
        gap: `${GAP}px`,
        marginBottom: '4px',
      }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: '9px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontFamily: 'var(--font-outfit)',
          }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Main table: periods 1–7 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: GRID_COL,
        gridTemplateRows: `repeat(7, ${CELL_HEIGHT}px)`,
        gap: `${GAP}px`,
      }}>
        {/* La placeholder (period 6, group 3) */}
        <div style={{ gridColumn: 3, gridRow: 6 }}>
          <PlaceholderCell label="57–71" cat="lanthanide" />
        </div>

        {/* Ac placeholder (period 7, group 3) */}
        <div style={{ gridColumn: 3, gridRow: 7 }}>
          <PlaceholderCell label="89–103" cat="actinide" />
        </div>

        {/* All main-block elements */}
        {ELEMENTS.map(el => (
          <div key={el.Z} style={{ gridColumn: el.group, gridRow: el.period }}>
            <ElemCell Z={el.Z} symbol={el.symbol} mass={el.mass} cat={el.cat} />
          </div>
        ))}
      </div>

      {/* f-block divider */}
      <div style={{
        margin: '10px 0 6px',
        fontSize: '9px',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        paddingLeft: '2px',
      }}>
        f-block elements (lanthanides &amp; actinides):
      </div>

      {/* Lanthanides row (columns 3–17 of an 18-col grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: GRID_COL,
        gridTemplateRows: `${CELL_HEIGHT}px`,
        gap: `${GAP}px`,
        marginBottom: `${GAP}px`,
      }}>
        <div style={{ gridColumn: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', color: CAT_COLORS.lanthanide, fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>6</span>
        </div>
        {LANTHANIDES.map((el, i) => (
          <div key={el.Z} style={{ gridColumn: i + 3 }}>
            <ElemCell Z={el.Z} symbol={el.symbol} mass={el.mass} cat={el.cat} />
          </div>
        ))}
      </div>

      {/* Actinides row (columns 3–17 of an 18-col grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: GRID_COL,
        gridTemplateRows: `${CELL_HEIGHT}px`,
        gap: `${GAP}px`,
      }}>
        <div style={{ gridColumn: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '9px', color: CAT_COLORS.actinide, fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>7</span>
        </div>
        {ACTINIDES.map((el, i) => (
          <div key={el.Z} style={{ gridColumn: i + 3 }}>
            <ElemCell Z={el.Z} symbol={el.symbol} mass={el.mass} cat={el.cat} />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 14px',
      }}>
        {(Object.keys(CAT_LABELS) as Category[]).map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '14px',
              height: '4px',
              background: CAT_COLORS[cat],
              borderRadius: '2px',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {CAT_LABELS[cat]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
