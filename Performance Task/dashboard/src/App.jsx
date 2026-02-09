import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell, ScatterChart, Scatter
} from 'recharts'

const COLORS = {
  slps: '#dc2626',
  district: '#2563eb',
  charter: '#16a34a',
  highlight: '#f59e0b',
  grid: '#e5e7eb',
  muted: '#9ca3af',
}

const DEMO_COLORS = {
  black_rate: '#6366f1',
  white_rate: '#f97316',
  hispanic_rate: '#14b8a6',
  asian_rate: '#ec4899',
  multirace_rate: '#8b5cf6',
}

const DEMO_LABELS = {
  black_rate: 'Black',
  white_rate: 'White',
  hispanic_rate: 'Hispanic',
  asian_rate: 'Asian',
  multirace_rate: 'Multirace',
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value != null ? `${p.value}%` : 'N/A'}
        </p>
      ))}
    </div>
  )
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-xs">
      <p className="font-semibold text-gray-700 mb-1 truncate">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {p.value != null ? `${p.value}%` : 'N/A'}
        </p>
      ))}
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [compareMode, setCompareMode] = useState('all')
  const [sortBy, setSortBy] = useState('attendance_rate')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetch('/data.json')
      .then(r => r.json())
      .then(d => {
        const filtered = {
          ...d,
          years: d.years.filter(y => y < 2024),
          district_data: d.district_data.filter(r => r.year < 2024),
          slps_schools: d.slps_schools.filter(r => r.year < 2024),
        }
        setData(filtered)
        setSelectedYear(Math.max(...filtered.years))
      })
  }, [])

  const slpsTrend = useMemo(() => {
    if (!data) return []
    return data.district_data
      .filter(d => d.district === data.slps)
      .sort((a, b) => a.year - b.year)
  }, [data])

  const allDistrictNames = useMemo(() => {
    if (!data) return []
    return [...new Set(data.district_data.map(d => d.district))].sort()
  }, [data])

  const yearData = useMemo(() => {
    if (!data || !selectedYear) return []
    return data.district_data
      .filter(d => d.year === selectedYear && d.attendance_rate != null)
      .sort((a, b) => sortDir === 'desc' ? (b[sortBy] || 0) - (a[sortBy] || 0) : (a[sortBy] || 0) - (b[sortBy] || 0))
  }, [data, selectedYear, sortBy, sortDir])

  const trendComparison = useMemo(() => {
    if (!data) return []
    let districts = [data.slps]
    if (compareMode === 'all') {
      // Compute MSA average
    } else if (compareMode === 'selected' && selectedDistricts.length > 0) {
      districts = [...districts, ...selectedDistricts]
    }

    const years = data.years
    return years.map(year => {
      const entry = { year }
      // SLPS
      const slpsRow = data.district_data.find(d => d.district === data.slps && d.year === year)
      entry['SLPS'] = slpsRow?.attendance_rate

      if (compareMode === 'all') {
        // MSA District average
        const districtRows = data.district_data.filter(
          d => d.type === 'district' && d.year === year && d.attendance_rate != null
        )
        if (districtRows.length > 0) {
          entry['MSA Districts Avg'] = Math.round(
            districtRows.reduce((s, r) => s + r.attendance_rate, 0) / districtRows.length * 100
          ) / 100
        }
        // Charter average
        const charterRows = data.district_data.filter(
          d => d.type === 'charter' && d.year === year && d.attendance_rate != null
        )
        if (charterRows.length > 0) {
          entry['Charters Avg'] = Math.round(
            charterRows.reduce((s, r) => s + r.attendance_rate, 0) / charterRows.length * 100
          ) / 100
        }
      } else {
        selectedDistricts.forEach(dist => {
          const row = data.district_data.find(d => d.district === dist && d.year === year)
          entry[dist] = row?.attendance_rate
        })
      }
      return entry
    })
  }, [data, compareMode, selectedDistricts])

  const slpsSchoolData = useMemo(() => {
    if (!data || !selectedYear) return []
    return data.slps_schools
      .filter(d => d.year === selectedYear && d.attendance_rate != null)
      .sort((a, b) => (b.attendance_rate || 0) - (a.attendance_rate || 0))
  }, [data, selectedYear])

  const demographicTrend = useMemo(() => {
    if (!data) return []
    return data.years.map(year => {
      const slpsRow = data.district_data.find(d => d.district === data.slps && d.year === year)
      return {
        year,
        black_rate: slpsRow?.black_rate,
        white_rate: slpsRow?.white_rate,
        hispanic_rate: slpsRow?.hispanic_rate,
        asian_rate: slpsRow?.asian_rate,
        multirace_rate: slpsRow?.multirace_rate,
      }
    })
  }, [data])

  const gradeLevelTrend = useMemo(() => {
    if (!data) return []
    return data.years.map(year => {
      const slpsRow = data.district_data.find(d => d.district === data.slps && d.year === year)
      return {
        year,
        'K-8': slpsRow?.k8_rate,
        '9-12': slpsRow?.hs_rate,
        'Overall': slpsRow?.attendance_rate,
      }
    })
  }, [data])

  const slpsLatest = useMemo(() => {
    if (!slpsTrend.length) return null
    return slpsTrend[slpsTrend.length - 1]
  }, [slpsTrend])

  const msaAvgLatest = useMemo(() => {
    if (!yearData.length) return null
    const districts = yearData.filter(d => d.type === 'district')
    if (!districts.length) return null
    return Math.round(districts.reduce((s, r) => s + r.attendance_rate, 0) / districts.length * 100) / 100
  }, [yearData])

  const charterAvgLatest = useMemo(() => {
    if (!yearData.length) return null
    const charters = yearData.filter(d => d.type === 'charter')
    if (!charters.length) return null
    return Math.round(charters.reduce((s, r) => s + r.attendance_rate, 0) / charters.length * 100) / 100
  }, [yearData])

  function toggleDistrict(dist) {
    setSelectedDistricts(prev =>
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Loading attendance data...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'comparison', label: 'District Comparison' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'schools', label: 'SLPS Schools' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            St. Louis MSA Attendance Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Proportional attendance rates (% of students with 90%+ attendance) across
            St. Louis Public Schools, area school districts, and charter schools
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Year selector */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <div className="flex gap-1 flex-wrap">
            {data.years.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedYear === y
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* ======================== OVERVIEW TAB ======================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={`SLPS Attendance Rate (${selectedYear})`}
                value={slpsLatest?.year === selectedYear
                  ? `${data.district_data.find(d => d.district === data.slps && d.year === selectedYear)?.attendance_rate ?? 'N/A'}%`
                  : 'N/A'}
                color="text-red-600"
                sub={`${data.district_data.find(d => d.district === data.slps && d.year === selectedYear)?.school_count ?? 0} schools`}
              />
              <StatCard
                label="MSA District Average"
                value={msaAvgLatest != null ? `${msaAvgLatest}%` : 'N/A'}
                color="text-blue-600"
              />
              <StatCard
                label="Charter School Average"
                value={charterAvgLatest != null ? `${charterAvgLatest}%` : 'N/A'}
                color="text-green-600"
              />
              <StatCard
                label="Gap (SLPS vs MSA Avg)"
                value={(() => {
                  const slpsRate = data.district_data.find(d => d.district === data.slps && d.year === selectedYear)?.attendance_rate
                  if (slpsRate != null && msaAvgLatest != null) {
                    const gap = Math.round((slpsRate - msaAvgLatest) * 100) / 100
                    return `${gap > 0 ? '+' : ''}${gap}pp`
                  }
                  return 'N/A'
                })()}
                color={(() => {
                  const slpsRate = data.district_data.find(d => d.district === data.slps && d.year === selectedYear)?.attendance_rate
                  if (slpsRate != null && msaAvgLatest != null) {
                    return slpsRate >= msaAvgLatest ? 'text-green-600' : 'text-red-600'
                  }
                  return 'text-gray-900'
                })()}
              />
            </div>

            {/* SLPS Trend Line */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                SLPS vs MSA Attendance Trend (2009–2023)
              </h2>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={trendComparison} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis domain={[30, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="SLPS" stroke={COLORS.slps} strokeWidth={3} dot={{ r: 4 }} />
                  {compareMode === 'all' && (
                    <>
                      <Line type="monotone" dataKey="MSA Districts Avg" stroke={COLORS.district} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Charters Avg" stroke={COLORS.charter} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    </>
                  )}
                  {compareMode === 'selected' && selectedDistricts.map((dist, i) => (
                    <Line key={dist} type="monotone" dataKey={dist} stroke={`hsl(${(i * 60 + 200) % 360}, 70%, 50%)`} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grade Level Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                SLPS Attendance by Grade Level
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={gradeLevelTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis domain={[20, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Overall" stroke={COLORS.slps} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="K-8" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="9-12" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ======================== COMPARISON TAB ======================== */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => { setCompareMode('all'); setSelectedDistricts([]) }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg ${compareMode === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Averages View
                </button>
                <button
                  onClick={() => setCompareMode('selected')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg ${compareMode === 'selected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Select Districts
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Sort:</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1.5 bg-white"
                >
                  <option value="attendance_rate">Overall Rate</option>
                  <option value="k8_rate">K-8 Rate</option>
                  <option value="hs_rate">9-12 Rate</option>
                  <option value="enrollment">Enrollment</option>
                </select>
                <button
                  onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                  className="text-xs bg-gray-100 px-2 py-1.5 rounded-lg hover:bg-gray-200"
                >
                  {sortDir === 'desc' ? '↓ High to Low' : '↑ Low to High'}
                </button>
              </div>
            </div>

            {/* Trend with comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Trend Comparison</h2>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={trendComparison} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis domain={[20, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="SLPS" stroke={COLORS.slps} strokeWidth={3} dot={{ r: 4 }} />
                  {compareMode === 'all' && (
                    <>
                      <Line type="monotone" dataKey="MSA Districts Avg" stroke={COLORS.district} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Charters Avg" stroke={COLORS.charter} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    </>
                  )}
                  {compareMode === 'selected' && selectedDistricts.map((dist, i) => (
                    <Line key={dist} type="monotone" dataKey={dist} stroke={`hsl(${(i * 60 + 200) % 360}, 70%, 50%)`} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart: All districts for selected year */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                All Districts & Charters — {selectedYear}
              </h2>
              <div style={{ height: Math.max(400, yearData.length * 26) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="district"
                      tick={{ fontSize: 10 }}
                      width={175}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="attendance_rate" name="Attendance Rate" radius={[0, 4, 4, 0]}>
                      {yearData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.district === 'ST. LOUIS CITY' ? COLORS.slps
                            : entry.type === 'charter' ? COLORS.charter
                            : selectedDistricts.includes(entry.district) ? COLORS.highlight
                            : COLORS.district
                          }
                          opacity={selectedDistricts.length > 0 && !selectedDistricts.includes(entry.district) && entry.district !== 'ST. LOUIS CITY' ? 0.3 : 1}
                          cursor="pointer"
                          onClick={() => { setCompareMode('selected'); toggleDistrict(entry.district) }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* District selector for comparison */}
            {compareMode === 'selected' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Selected for comparison ({selectedDistricts.length}):
                  {selectedDistricts.length === 0 && <span className="font-normal text-gray-400 ml-2">Click bars above or names below to select</span>}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDistricts.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      {d} ✕
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-h-60 overflow-y-auto">
                  {allDistrictNames.filter(d => d !== data.slps).map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDistrict(d)}
                      className={`text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                        selectedDistricts.includes(d) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {selectedDistricts.includes(d) ? '✓ ' : ''}{d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================== DEMOGRAPHICS TAB ======================== */}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                SLPS Attendance by Race/Ethnicity Over Time
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={demographicTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis domain={[20, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.entries(DEMO_COLORS).map(([key, color]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={DEMO_LABELS[key]}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Demographic comparison: SLPS vs MSA for selected year */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Demographic Attendance Comparison — {selectedYear}
              </h2>
              {(() => {
                const slpsRow = data.district_data.find(d => d.district === data.slps && d.year === selectedYear)
                const msaRows = data.district_data.filter(d => d.type === 'district' && d.year === selectedYear)
                const demoKeys = ['black_rate', 'white_rate', 'hispanic_rate', 'asian_rate', 'multirace_rate']
                const chartData = demoKeys.map(key => {
                  const msaVals = msaRows.map(r => r[key]).filter(v => v != null)
                  return {
                    name: DEMO_LABELS[key],
                    SLPS: slpsRow?.[key] ?? null,
                    'MSA Avg': msaVals.length > 0 ? Math.round(msaVals.reduce((a, b) => a + b, 0) / msaVals.length * 100) / 100 : null,
                  }
                })
                return (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<BarTooltip />} />
                      <Legend />
                      <Bar dataKey="SLPS" fill={COLORS.slps} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="MSA Avg" fill={COLORS.district} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>
          </div>
        )}

        {/* ======================== SCHOOLS TAB ======================== */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                SLPS Individual Schools — {selectedYear}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {slpsSchoolData.length} schools with available data
              </p>
              <div style={{ height: Math.max(400, slpsSchoolData.length * 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={slpsSchoolData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="school"
                      tick={{ fontSize: 9 }}
                      width={195}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="attendance_rate" name="Attendance Rate" radius={[0, 4, 4, 0]}>
                      {slpsSchoolData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.attendance_rate >= 80 ? '#16a34a'
                            : entry.attendance_rate >= 60 ? '#f59e0b'
                            : '#dc2626'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* School trend for top/bottom 5 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Top & Bottom 5 SLPS Schools — Trend Over Time
              </h2>
              {(() => {
                const top5 = slpsSchoolData.slice(0, 5).map(s => s.school)
                const bottom5 = slpsSchoolData.slice(-5).map(s => s.school)
                const schools = [...top5, ...bottom5]
                const trendData = data.years.map(year => {
                  const entry = { year }
                  schools.forEach(school => {
                    const row = data.slps_schools.find(s => s.school === school && s.year === year)
                    entry[school] = row?.attendance_rate
                  })
                  return entry
                })
                const topColors = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']
                const bottomColors = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca']
                return (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={v => `${v}%`} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {top5.map((school, i) => (
                        <Line key={school} type="monotone" dataKey={school} stroke={topColors[i]} strokeWidth={2} dot={{ r: 2 }} connectNulls />
                      ))}
                      {bottom5.map((school, i) => (
                        <Line key={school} type="monotone" dataKey={school} stroke={bottomColors[i]} strokeWidth={2} dot={{ r: 2 }} strokeDasharray="4 4" connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>
          </div>
        )}

        {/* Legend / Key */}
        <div className="mt-8 text-xs text-gray-400 flex gap-6 justify-center">
          <span><span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS.slps }}></span>SLPS</span>
          <span><span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS.district }}></span>MSA Districts</span>
          <span><span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS.charter }}></span>Charter Schools</span>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-4 pb-8">
          Data source: Missouri DESE — Proportional Attendance (% students with 90%+ attendance rate)
        </footer>
      </main>
    </div>
  )
}
