import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-4 sm:p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center justify-center gap-2.5 sm:gap-3 self-center font-medium shrink-0 max-w-full overflow-hidden px-2"
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

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl shadow-md border-border/80">
                        <CardHeader className="px-5 sm:px-10 pt-6 sm:pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-5 sm:px-10 py-6 sm:py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
