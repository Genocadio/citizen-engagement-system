/**
 * @fileoverview LocationSelector component for handling location input in forms.
 * This component provides a hierarchical location selection system with special
 * handling for Rwanda's administrative divisions (provinces, districts, sectors).
 */

"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries, rwandaProvinces, getDistrictsByProvince, getSectorsByDistrict } from "@/lib/location-data"

/**
 * Props interface for the LocationSelector component
 * @interface LocationSelectorProps
 * @property {string} [defaultCountry="Rwanda"] - Initial country selection
 * @property {string} [defaultProvince=""] - Initial province/state selection
 * @property {string} [defaultDistrict=""] - Initial district selection
 * @property {string} [defaultSector=""] - Initial sector selection
 * @property {string} [defaultOtherDetails=""] - Initial additional location details
 * @property {Function} onLocationChange - Callback function triggered when location changes
 */
interface LocationSelectorProps {
  defaultCountry?: string
  defaultProvince?: string
  defaultDistrict?: string
  defaultSector?: string
  defaultOtherDetails?: string
  onLocationChange: (location: {
    country: string
    province: string
    district: string
    sector: string
    otherDetails?: string
  }) => void
}

/**
 * LocationSelector component for handling hierarchical location selection.
 * 
 * @component
 * @param {LocationSelectorProps} props - The component props
 * @returns {JSX.Element} A form with the following features:
 * - Country selection (defaults to Rwanda)
 * - Province/State selection (dropdown for Rwanda, text input for others)
 * - District selection (dropdown for Rwanda, text input for others)
 * - Sector selection (dropdown for Rwanda, text input for others)
 * - Optional additional location details
 * 
 * @example
 * ```tsx
 * <LocationSelector
 *   defaultCountry="Rwanda"
 *   onLocationChange={(location) => console.log(location)}
 * />
 * ```
 * 
 * @note
 * - For Rwanda, uses predefined lists of provinces, districts, and sectors
 * - For other countries, provides text input fields
 * - Automatically updates available options based on parent selection
 */
const LocationSelector = memo(function LocationSelector({
  defaultCountry = "Rwanda",
  defaultProvince = "",
  defaultDistrict = "",
  defaultSector = "",
  defaultOtherDetails = "",
  onLocationChange,
}: LocationSelectorProps) {
  const [country, setCountry] = useState(defaultCountry)
  const [province, setProvince] = useState(defaultProvince)
  const [district, setDistrict] = useState(defaultDistrict)
  const [sector, setSector] = useState(defaultSector)
  const [otherDetails, setOtherDetails] = useState(defaultOtherDetails)

  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  // Update districts when province changes
  useEffect(() => {
    if (country === "Rwanda" && province) {
      setDistricts(getDistrictsByProvince(province))
    } else {
      setDistricts([])
    }
    setDistrict("")
    setSector("")
  }, [country, province])

  // Update sectors when district changes
  useEffect(() => {
    if (country === "Rwanda" && district) {
      setSectors(getSectorsByDistrict(district))
    } else {
      setSectors([])
    }
    setSector("")
  }, [country, district])

  // Notify parent component when location changes
  useEffect(() => {
    onLocationChange({
      country,
      province,
      district,
      sector,
      otherDetails,
    })
  }, [country, province, district, sector, otherDetails, onLocationChange])

  const handleCountryChange = useCallback((value: string) => {
    setCountry(value)
    if (value !== "Rwanda") {
      setProvince("")
      setDistrict("")
      setSector("")
    }
  }, [])

  const handleProvinceChange = useCallback((value: string) => {
    setProvince(value)
  }, [])

  const handleDistrictChange = useCallback((value: string) => {
    setDistrict(value)
  }, [])

  const handleSectorChange = useCallback((value: string) => {
    setSector(value)
  }, [])

  const handleOtherDetailsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherDetails(e.target.value)
  }, [])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">Province/State</Label>
        {country === "Rwanda" ? (
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger id="province">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {rwandaProvinces.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="province"
            placeholder="Enter province or state"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        {country === "Rwanda" && districts.length > 0 ? (
          <Select value={district} onValueChange={handleDistrictChange}>
            <SelectTrigger id="district">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="district"
            placeholder="Enter district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Sector</Label>
        {country === "Rwanda" && sectors.length > 0 ? (
          <Select value={sector} onValueChange={handleSectorChange}>
            <SelectTrigger id="sector">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input id="sector" placeholder="Enter sector" value={sector} onChange={(e) => setSector(e.target.value)} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherDetails">Other Location Details (Optional)</Label>
        <Input
          id="otherDetails"
          placeholder="Street address, landmark, or additional details"
          value={otherDetails}
          onChange={handleOtherDetailsChange}
        />
      </div>
    </div>
  )
})

export { LocationSelector }
