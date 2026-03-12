"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface Filters {
  region: string
  industry: string
  companySize: string
  minFitScore: number
}

interface FilterBarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const regionOptions = ["All", "North America", "Europe", "Asia Pacific", "Latin America"]
const industryOptions = ["All", "SaaS", "Cybersecurity", "Fintech", "Healthcare", "E-Commerce", "Manufacturing", "EdTech", "MarTech"]
const companySizeOptions = ["All", "SMB", "Mid-Market", "Enterprise"]

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select
        value={value || "All"}
        onValueChange={(val) => onChange(!val || val === "All" ? "" : val)}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <FilterSelect
        label="Region"
        value={filters.region}
        options={regionOptions}
        onChange={(region) => onFilterChange({ ...filters, region })}
      />
      <FilterSelect
        label="Industry"
        value={filters.industry}
        options={industryOptions}
        onChange={(industry) => onFilterChange({ ...filters, industry })}
      />
      <FilterSelect
        label="Company Size"
        value={filters.companySize}
        options={companySizeOptions}
        onChange={(companySize) => onFilterChange({ ...filters, companySize })}
      />
      <div className="flex min-w-48 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Min Fit Score: {filters.minFitScore}
        </label>
        <Slider
          value={[filters.minFitScore]}
          onValueChange={(val) =>
            onFilterChange({
              ...filters,
              minFitScore: Array.isArray(val) ? val[0] : (val as number),
            })
          }
          min={0}
          max={100}
          step={5}
        />
      </div>
    </div>
  )
}

export default FilterBar
