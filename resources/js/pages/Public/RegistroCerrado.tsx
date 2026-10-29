import { Head } from '@inertiajs/react';
import { CalendarClock, FileCheck2, Info } from 'lucide-react';

export default function RegistroCerrado() {
    return (
        <>
            <Head title="Período de registro concluido" />

            <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <header className="relative overflow-hidden border-b border-blue-900/30 bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-950 px-6 py-8 text-center text-white sm:px-10">
                        <div className="absolute -top-16 -right-10 size-48 rounded-full bg-blue-400/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col items-center">
                            <img
                                src="/icons/logo_mmm.png"
                                alt="Logo del Movimiento Misionero Mundial"
                                className="mb-4 h-16 w-auto object-contain drop-shadow-md"
                            />
                            <h1 className="text-sm font-black tracking-wider uppercase sm:text-base">
                                Movimiento Misionero Mundial
                            </h1>
                            <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-blue-200 uppercase">
                                República Bolivariana de Venezuela
                            </p>
                            <p className="mt-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 font-mono text-[10px] text-slate-200">
                                RIF: J-30187446-3 · N.º DG/520 DF/620-100.361
                            </p>
                        </div>
                    </header>

                    <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <CalendarClock
                                className="size-8"
                                aria-hidden="true"
                            />
                        </div>

                        <div className="space-y-3 text-center">
                            <p className="text-xs font-bold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-300">
                                Aviso importante
                            </p>
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                El período de registro ha concluido
                            </h2>
                            <p className="mx-auto max-w-xl leading-7 text-slate-600 dark:text-slate-300">
                                El plazo establecido para el registro y la
                                actualización de la información ministerial ha
                                finalizado. Por este motivo, el formulario en
                                línea se encuentra cerrado y ya no es posible
                                enviar nuevas solicitudes ni modificar los datos
                                mediante esta vía.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/30">
                            <div className="flex items-start gap-3">
                                <Info
                                    className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300"
                                    aria-hidden="true"
                                />
                                <p className="text-sm leading-6 text-blue-950 dark:text-blue-100">
                                    Si necesita realizar una consulta o requiere
                                    orientación sobre la actualización de sus
                                    datos, por favor comuníquese con la
                                    instancia ministerial correspondiente.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <FileCheck2 className="size-4" aria-hidden="true" />
                            <span>Agradecemos su atención y colaboración.</span>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
