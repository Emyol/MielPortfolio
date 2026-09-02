"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CredentialSlide = {
  image?: string;
  name: string;
  detail: string;
  issuer: string;
  year: string;
  imagePosition?: string;
};

type CarouselCustomNavigationProps = {
  items: CredentialSlide[];
};

const CarouselCustomNavigation = ({ items }: CarouselCustomNavigationProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelected(api.selectedScrollSnap());
    };

    updateState();
    api.on("select", updateState);
    api.on("reInit", updateState);

    return () => {
      api.off("select", updateState);
      api.off("reInit", updateState);
    };
  }, [api]);

  return (
    <div className="relative min-w-0 w-full overflow-hidden" aria-label="Certificates gallery">
      <Carousel setApi={setApi} opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-3 md:-ml-5">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.name}-${index}`}
              className="basis-[92%] pl-3 sm:basis-[78%] md:basis-[62%] md:pl-5 lg:basis-[52%]"
            >
              <figure
                className="group relative overflow-hidden rounded-[2px] border border-border bg-card outline-none"
                tabIndex={0}
                aria-label={`${item.name}. ${item.detail}`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    width={1600}
                    height={1200}
                    loading={index < 2 ? "eager" : "lazy"}
                    className="aspect-4/3 w-full object-contain p-3 grayscale transition-transform duration-500 ease-out group-hover:scale-[1.015] group-focus-visible:scale-[1.015] motion-reduce:transform-none"
                    style={{ objectPosition: item.imagePosition ?? "center" }}
                  />
                ) : (
                  <div className="flex aspect-4/3 w-full items-start justify-end bg-[linear-gradient(135deg,#191919,#0b0b0b)] p-5 text-right">
                    <span className="max-w-[12ch] font-serif text-3xl leading-none tracking-[-0.04em] text-white/20 sm:text-4xl">
                      {item.issuer}
                    </span>
                  </div>
                )}
                <figcaption className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black from-25% via-black/70 to-transparent p-5 text-white opacity-100 transition-opacity duration-300 ease-out [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:opacity-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl leading-[1.08] tracking-[-0.025em] sm:text-2xl">
                        {item.name}
                      </h3>
                      <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-white/78">
                        {item.detail}
                      </p>
                    </div>
                    {item.year ? (
                      <span className="shrink-0 text-xs tabular-nums text-white/60">
                        {item.year}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-xs tracking-[0.04em] text-white/60">{item.issuer}</p>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            className="h-10 w-10 rounded-[2px] bg-background transition-transform hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            className="h-10 w-10 rounded-[2px] bg-background transition-transform hover:scale-[1.03] active:scale-[0.97] motion-reduce:transform-none"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
          {String(selected + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
};

export default CarouselCustomNavigation;
