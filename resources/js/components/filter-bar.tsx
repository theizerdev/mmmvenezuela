
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * @typedef FilterFieldProps
 * @property {string} label - La etiqueta que se mostrará encima del campo de filtro.
 * @property {React.ReactNode} children - El componente de input (ej. Input, Select) que se renderizará.
 * @property {string} [className] - Clases CSS adicionales para el contenedor del campo.
 */
interface FilterFieldProps {
    label?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Un componente auxiliar para renderizar una etiqueta y un campo de formulario
 * dentro de la barra de filtros.
 *
 * @param {FilterFieldProps} props
 * @returns {JSX.Element}
 */
export function FilterField({ label, children, className }: FilterFieldProps) {
    return (
        <div className={cn('flex flex-col space-y-1.5', className)}>
            {label ? (
                <label className='text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider'>
                    {label}
                </label>
            ) : (
                <span className='text-xs font-semibold uppercase tracking-wider select-none opacity-0 pointer-events-none' aria-hidden="true">
                    &nbsp;
                </span>
            )}
            {children}
        </div>
    );
}

/**
 * @typedef FilterBarProps
 * @property {React.ReactNode} children - Los elementos que se mostrarán dentro de la barra de filtros.
 * @property {string} [className] - Clases CSS adicionales para el contenedor principal de la tarjeta.
 * @property {string} [containerClassName] - Clases CSS adicionales para el contenedor interno de elementos.
 */
interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

/**
 * Un componente contenedor para agrupar controles de filtro y acciones.
 * Proporciona un estilo de tarjeta y alinea los elementos.
 *
 * @param {FilterBarProps} props
 * @returns {JSX.Element}
 */
export function FilterBar({ children, className, containerClassName }: FilterBarProps) {
    return (
        <Card className={cn('p-4 sm:p-5', className)}>
            <div className={cn('flex flex-wrap items-end justify-between gap-4', containerClassName)}>
                {children}
            </div>
        </Card>
    );
}