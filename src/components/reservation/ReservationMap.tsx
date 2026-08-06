import Image from 'next/image';

export default function ReservationMap() {
    return (
        <div className="w-full">
            <div className="bg-black py-12 px-4">
                <div className="flex flex-col items-center justify-center gap-8">
                    <h3 className="text-white text-3xl md:text-4xl font-semibold">
                        Easy Location
                    </h3>
                    <p className="text-white/80 font-normal text-sm md:text-base text-center">
                        Easily find us with our interactive map below
                    </p>
                </div>
            </div>

            <div className="relative w-full h-[458px]">
                <Image
                    src="/reservation/map.png"
                    alt="map"
                    fill
                    className="object-cover"
                />
            </div>
        </div>
    );
}
