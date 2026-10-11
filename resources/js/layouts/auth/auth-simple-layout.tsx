import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 sm:p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex items-center gap-2.5 sm:gap-3 font-medium shrink-0 max-w-full overflow-hidden px-2"
                        >
                            <img
                                src="/icons/logo_mmm-a-color-sin-fondo.png"
                                alt="Movimiento Misionero Mundial"
                                className="h-10 sm:h-14 md:h-16 w-auto object-contain shrink-0"
                            />
                            <div className="flex flex-col justify-center text-left select-none min-w-0">
                                <span className="font-sans text-[8.5px] sm:text-[11px] font-semibold tracking-wider leading-tight text-slate-800 dark:text-slate-200 uppercase truncate">
                                    IGLESIA CRISTIANA PENTECOSTÉS VENEZUELA
                                </span>
                                <span className="font-cocogoose text-[13px] sm:text-[17px] md:text-[19px] font-black tracking-normal leading-none text-black dark:text-white uppercase truncate mt-0.5">
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
