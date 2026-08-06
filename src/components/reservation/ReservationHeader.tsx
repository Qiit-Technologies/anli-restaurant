'use client';

import Image from 'next/image';

interface ReservationHeaderProps {
    hotelName?: string;
    hotelLogo?: string;
}

export default function ReservationHeader({ hotelName, hotelLogo }: ReservationHeaderProps) {
    return (
        <section className="w-full relative h-[300px] md:h-[400px] overflow-hidden">
            <Image
                src="/reservation/reservationBg.jpg"
                alt="reservation-header"
                fill
                className="object-cover"
                priority
            />

            <div className="absolute inset-0 bg-[#19161691]" />

            <div className="absolute top-[24%] inset-0 flex flex-col items-center justify-center text-white z-10 px-4">
                <div className="w-full max-w-[494px] flex flex-col items-center">
                    <div className="flex items-center justify-center md:justify-between w-full mb-6">
                        <div className="hidden md:flex items-center">
                            <Image
                                src="/reservation/arrowLeft.svg"
                                alt="arrow-left"
                                width={136}
                                height={0}
                            />
                        </div>

                        <Image
                            src={hotelLogo || "/logos/anli-logo.png"}
                            alt={hotelName || "Anli Logo"}
                            width={75}
                            height={43}
                            className="object-contain"
                        />

                        <div className="hidden md:flex items-center">
                            <Image
                                src="/reservation/arrowRight.svg"
                                alt="arrow-right"
                                width={136}
                                height={0}
                            />
                        </div>
                    </div>

                    <div className="text-center w-full">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-[11px]">
                            {hotelName ? `Reservation at ${hotelName}` : 'Reservation'}
                        </h1>
                        <p className="text-sm md:text-base lg:text-[20px] font-semibold">
                            We are delighted to welcome you to our restaurant.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
