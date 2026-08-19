import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-3 font-medium shrink-0"
                        >
                            <img
                                src="/icons/logo_mmm-a-color-sin-fondo.png"
                                alt="Movimiento Misionero Mundial"
                                className="h-12 sm:h-14 md:h-16 w-auto object-contain shrink-0"
                            />
                            <div className="flex flex-col justify-center text-left select-none">
                                <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.13em] leading-tight text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
                                    IGLESIA CRISTIANA PENTECOSTÉS VENEZUELA
                                </span>
                                <span className="font-cocogoose text-[15px] sm:text-[17px] md:text-[19px] font-black tracking-normal leading-none text-black dark:text-white uppercase whitespace-nowrap mt-0.5">
                                    MOVIMIENTO MISIONERO MUNDIAL
                                </span>
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}


                </div>
            </div>
        </div>
    );
}
