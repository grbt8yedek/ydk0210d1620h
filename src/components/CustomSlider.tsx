"use client";

import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface CustomSliderProps {
  // Slider özellikleri
  min: number;
  max: number;
  value: number | number[];
  onChange: (value: number | number[]) => void;
  
  // Görünüm özellikleri
  range?: boolean;
  step?: number;
  allowCross?: boolean;
  
  // Etiket özellikleri
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  formatValue?: (value: number) => string;
  
  // Stil özellikleri
  className?: string;
  showLabels?: boolean;
}

export default function CustomSlider({
  min,
  max,
  value,
  onChange,
  range = false,
  step = 1,
  allowCross = false,
  label,
  leftLabel,
  rightLabel,
  formatValue,
  className = "",
  showLabels = true
}: CustomSliderProps) {
  
  // Ortak slider stilleri - tekrar eden kodları önlemek için
  const sliderStyles = {
    track: { backgroundColor: '#2563eb', height: 6 },
    handle: {
      borderColor: '#2563eb',
      backgroundColor: '#ffffff',
      opacity: 1,
      borderWidth: 2,
      height: 18,
      width: 18,
      marginTop: -6,
    },
    rail: { backgroundColor: '#e5e7eb', height: 6 },
  };

  // Varsayılan değer formatı
  const defaultFormatValue = (val: number) => {
    if (formatValue) return formatValue(val);
    return val.toString();
  };

  // Etiketleri oluştur
  const renderLabels = () => {
    if (!showLabels) return null;
    
    if (range && Array.isArray(value)) {
      return (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{leftLabel || defaultFormatValue(value[0])}</span>
          <span>{rightLabel || defaultFormatValue(value[1])}</span>
        </div>
      );
    } else if (!range && typeof value === 'number') {
      return (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{leftLabel || defaultFormatValue(min)}</span>
          <span className="font-bold">{rightLabel || defaultFormatValue(value)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {label && (
        <h4 className="font-semibold mb-2">{label}</h4>
      )}
      <div className="px-2">
        <Slider
          range={range}
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          allowCross={allowCross}
          step={step}
          styles={sliderStyles}
        />
      </div>
      {renderLabels()}
    </div>
  );
} 