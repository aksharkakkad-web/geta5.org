'use client'

import React from 'react'

const MONO: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontFamily: 'var(--font-outfit)',
  marginBottom: '6px',
}

const sectionStyle: React.CSSProperties = {
  paddingBottom: '12px',
  marginBottom: '12px',
  borderBottom: '1px solid var(--bg-border)',
}

const noteStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  lineHeight: 1.55,
  marginTop: '4px',
}

const inlineCodeStyle: React.CSSProperties = {
  ...MONO,
  fontSize: '11px',
  color: 'var(--text-secondary)',
  background: 'var(--bg-card)',
  border: '1px solid var(--bg-border)',
  borderRadius: '3px',
  padding: '0 4px',
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        ...MONO,
        fontSize: '11px',
        color: 'var(--text-secondary)',
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: '4px',
        padding: '8px 10px',
        margin: '6px 0 0 0',
        overflowX: 'auto',
        whiteSpace: 'pre',
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  )
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '8px',
        marginBottom: '2px',
      }}
    >
      <code style={inlineCodeStyle}>{left}</code>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, alignSelf: 'center' }}>{right}</span>
    </div>
  )
}

export default function CSPReferenceSheet() {
  return (
    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>

      {/* VARIABLES & ASSIGNMENT */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Variables &amp; Assignment</div>
        <CodeBlock>{'a \u2190 expression\na \u2190 b'}</CodeBlock>
        <div style={noteStyle}><code style={MONO}>\u2190</code> means &quot;is assigned the value of&quot;</div>
      </div>

      {/* DISPLAY & INPUT */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Display &amp; Input</div>
        <Row left="DISPLAY(expression)" right="Displays value" />
        <Row left="INPUT()" right="Returns user input" />
      </div>

      {/* ARITHMETIC OPERATORS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Arithmetic Operators</div>
        <CodeBlock>{'+ \u2212 * / MOD'}</CodeBlock>
        <div style={noteStyle}>
          <code style={MONO}>a / b</code> truncates toward zero when both are integers.{' '}
          <code style={MONO}>a MOD b</code> returns the remainder.
        </div>
      </div>

      {/* RELATIONAL & BOOLEAN */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Relational &amp; Boolean</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Relational: <code style={MONO}>=  \u2260  &lt;  &gt;  \u2264  \u2265</code>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Boolean: <code style={MONO}>NOT</code>, <code style={MONO}>AND</code>, <code style={MONO}>OR</code>
        </div>
      </div>

      {/* SELECTION */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Selection</div>
        <CodeBlock>{'IF(condition)\n{\n  <block of statements>\n}\n\nIF(condition)\n{\n  <block>\n}\nELSE\n{\n  <block>\n}'}</CodeBlock>
      </div>

      {/* ITERATION */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Iteration</div>
        <CodeBlock>{'REPEAT n TIMES\n{\n  <block>\n}\n\nREPEAT UNTIL(condition)\n{\n  <block>\n}\n\nFOR EACH item IN aList\n{\n  <block>\n}'}</CodeBlock>
      </div>

      {/* LISTS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Lists</div>
        <Row left="aList[i]" right="Access at index i (1-based)" />
        <Row left="aList \u2190 [v1, v2]" right="Create list" />
        <Row left="INSERT(aList, i, val)" right="Insert at index i" />
        <Row left="APPEND(aList, val)" right="Add to end" />
        <Row left="REMOVE(aList, i)" right="Remove at index i" />
        <Row left="LENGTH(aList)" right="Number of elements" />
      </div>

      {/* PROCEDURES */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Procedures</div>
        <CodeBlock>{'PROCEDURE name(param1, param2)\n{\n  <instructions>\n  RETURN(value)\n}\nresult \u2190 name(arg1, arg2)'}</CodeBlock>
      </div>

      {/* RANDOM */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Random</div>
        <Row left="RANDOM(a, b)" right="Random integer, a to b inclusive" />
      </div>

      {/* COMMENTS */}
      <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
        <div style={sectionHeaderStyle}>Comments</div>
        <CodeBlock>{'// This is a comment'}</CodeBlock>
      </div>
    </div>
  )
}
