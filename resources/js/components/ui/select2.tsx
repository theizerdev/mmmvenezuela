import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Select2Option {
    value: string | number;
    label: string;
    sublabel?: string;
    description?: string;
    icon?: React.ReactNode;
}

export interface Select2Props {
    options: Select2Option[];
    value?: string | number | null;
    onChange: (value: any) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    clearable?: boolean;
}

export function Select2({
    options = [],
    value,
    onChange,
    placeholder = 'Seleccione una opción...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'No se encontraron resultados',
    disabled = false,
    className,
    id,
    clearable = false,
}: Select2Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const filteredOptions = options.filter((opt) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        const labelMatch = opt.label.toLowerCase().includes(query);
        const sublabelMatch = opt.sublabel ? opt.sublabel.toLowerCase().includes(query) : false;
        const descMatch = opt.description ? opt.description.toLowerCase().includes(query) : false;
        return labelMatch || sublabelMatch || descMatch;
    });

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        } else {
            setSearch('');
        }
    }, [open]);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal text-left h-10 px-3 py-2 bg-background hover:bg-accent/50 border-input shadow-xs transition-colors rounded-md text-sm',
                        !selectedOption && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="truncate flex items-center gap-2">
                        {selectedOption ? (
                            <>
                                {selectedOption.icon}
                                <span className="font-medium text-foreground">{selectedOption.label}</span>
                                {selectedOption.sublabel && (
                                    <span className="text-xs text-muted-foreground font-normal">
                                        ({selectedOption.sublabel})
                                    </span>
                                )}
                            </>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {clearable && selectedOption && (
                            <span
                                role="button"
                                onClick={handleClear}
                                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground transition-colors"
                            >
                                <X className="size-3.5" />
                            </span>
                        )}
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] shadow-md border rounded-md bg-popover text-popover-foreground overflow-hidden"
            >
                {/* Search Header */}
                <div className="flex items-center border-b px-3 py-2 bg-muted/20">
                    <Search className="mr-2 size-4 shrink-0 opacity-50" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                {/* Options List */}
                <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                            {emptyText}
                        </div>
                    ) : (
                        filteredOptions.map((opt) => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <div
                                    key={String(opt.value)}
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        'relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                                        isSelected && 'bg-accent/80 font-medium text-accent-foreground'
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        {opt.icon}
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate">{opt.label}</span>
                                            {opt.sublabel && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {opt.sublabel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default Select2;
