import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PeriodFilterProps {
  onPeriodChange?: (period: string, dateRange?: { from: Date; to: Date }) => void;
}

const periods = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7days' },
  { label: '14 dias', value: '14days' },
  { label: '30 dias', value: '30days' },
  { label: 'Mês atual', value: 'month' },
];

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ onPeriodChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isCustom, setIsCustom] = useState(false);

  const handlePeriodSelect = (value: string) => {
    setSelectedPeriod(value);
    setIsCustom(false);
    onPeriodChange?.(value);
  };

  const handleCustomDateSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    if (range.from && range.to) {
      setIsCustom(true);
      setSelectedPeriod('');
      onPeriodChange?.('custom', { from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value && !isCustom ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodSelect(period.value)}
          className="text-sm"
        >
          {period.label}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? 'default' : 'outline'}
            size="sm"
            className={cn('justify-start text-left font-normal min-w-[200px]')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isCustom && dateRange.from && dateRange.to ? (
              <>
                {format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} -{' '}
                {format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}
              </>
            ) : (
              <span>Personalizado</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={(range) => {
              if (range) {
                handleCustomDateSelect({ from: range.from, to: range.to });
              } else {
                handleCustomDateSelect({ from: undefined, to: undefined });
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
