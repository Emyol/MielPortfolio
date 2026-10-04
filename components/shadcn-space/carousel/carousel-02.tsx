"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogClose,
} from "@/components/motion-primitives/morphing-dialog";

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
  const reduced = useMotionPreference();
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
      <Carousel setApi={setApi} opts={{ align: "start", duration: reduced ? 0 : 25 }} className="w-full">
        <CarouselContent className="-ml-3 md:-ml-5">
          {items.map((item, index) => (
            <CarouselItem
              key={`${item.name}-${index}`}
              className="basis-[92%] pl-3 sm:basis-[78%] md:basis-[62%] md:pl-5 lg:basis-[52%]"
            >
              <MorphingDialog transition={{ type: "spring", bounce: 0.05, duration: 0.35 }}>
                <MorphingDialogTrigger
                  ariaLabel={item.name}
                  className="credential-card group block w-full overflow-hidden rounded-[2px] border border-border bg-card text-left text-white"
                >
                  {item.image ? (
                    <MorphingDialogImage
                      src={item.image}
                      alt=""
                      width={1600}
                      height={1200}
                      loading={index < 2 ? "eager" : "lazy"}
                      className="aspect-4/3 w-full object-contain p-3 grayscale"
                      style={{ objectPosition: item.imagePosition ?? "center" }}
                    />
                  ) : null}
                  <span className="credential-card-summary">
                    <span className="min-w-0">
                      <MorphingDialogTitle className="block font-serif text-lg leading-[1.08] tracking-[-0.025em] sm:text-xl">
                        {item.name}
                      </MorphingDialogTitle>
                      <MorphingDialogSubtitle className="mt-1 block text-xs text-white/65">
                        {item.issuer}
                      </MorphingDialogSubtitle>
                    </span>
                    <Plus size={18} className="shrink-0 text-white/75" aria-hidden="true" />
                  </span>
                </MorphingDialogTrigger>
                <MorphingDialogContainer>
                  <MorphingDialogContent className="credential-dialog pointer-events-auto relative w-full max-w-[640px] rounded-[2px] border border-border bg-card text-white">
                    {item.image ? (
                      <MorphingDialogImage
                        src={item.image}
                        alt=""
                        width={1600}
                        height={1200}
                        className="aspect-4/3 w-full object-contain p-3 grayscale"
                        style={{ objectPosition: item.imagePosition ?? "center" }}
                      />
                    ) : null}
                    <div className="credential-dialog-copy">
                      <div className="flex items-start justify-between gap-5">
                        <MorphingDialogTitle className="font-serif text-2xl leading-[1.08] tracking-[-0.025em] sm:text-3xl">
                          {item.name}
                        </MorphingDialogTitle>
                        {item.year ? <span className="shrink-0 text-xs tabular-nums text-white/60">{item.year}</span> : null}
                      </div>
                      <MorphingDialogSubtitle className="mt-2 text-xs tracking-[0.04em] text-white/60">
                        {item.issuer}
                      </MorphingDialogSubtitle>
                      <MorphingDialogDescription
                        disableLayoutAnimation
                        className="mt-4 text-sm leading-relaxed text-white/80"
                        variants={{
                          initial: { opacity: 0, y: 8 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: 8 },
                        }}
                      >
                        {item.detail}
                      </MorphingDialogDescription>
                    </div>
                    <MorphingDialogClose className="credential-dialog-close" />
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev(reduced)}
            disabled={!canScrollPrev}
            className="h-10 w-10 rounded-[2px] bg-background transition-transform active:scale-[0.97] motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext(reduced)}
            disabled={!canScrollNext}
            className="h-10 w-10 rounded-[2px] bg-background transition-transform active:scale-[0.97] motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.03]"
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
