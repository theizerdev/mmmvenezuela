import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid min-h-svh w-full lg:grid-cols-2">
            {/* Visual panel */}
            <div className="relative hidden flex-col justify-end overflow-hidden p-12 text-white lg:flex">
                {/* Background Image with smooth zoom micro-animation */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out hover:scale-110"
                    style={{ backgroundImage: 'url("/image/login_corporate_bg.png")' }}
                />
                {/* Subtle vignette overlay to keep footer readable while showcasing the image */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

                <p className="relative z-10 text-sm text-white/70 font-medium drop-shadow-sm">
                    © {new Date().getFullYear()} {name}. Todos los derechos
                    reservados.
                </p>
            </div>

            {/* Form panel */}
            <div className="flex flex-col items-center justify-center bg-background p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <Link
                        href={home()}
                        className="mb-8 flex items-center justify-center gap-3 shrink-0"
                    >
                        <img
                            src="/icons/logo_mmm-a-color-sin-fondo.png"
                            alt="Movimiento Misionero Mundial"
                            className="h-12 sm:h-14 md:h-16 w-auto object-contain shrink-0"
                        />
                        <div className="flex flex-col justify-center text-left select-none">
                            <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.13em] leading-tight text-slate-800 dark:text-slate-200 uppercase whitespace-nowrap">
                                IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
                            </span>
                            <span className="font-cocogoose text-[14.8px] sm:text-[15px] md:text-[17px] font-black tracking-normal leading-none text-black dark:text-white uppercase whitespace-nowrap mt-0.5">
                                MOVIMIENTO MISIONERO MUNDIAL
                            </span>
                        </div>
                    </Link>

                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-balance text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}


                </div>
            </div>
        </div>
    );
}