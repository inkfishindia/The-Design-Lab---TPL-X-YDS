import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ResizableBox } from 'react-resizable';

const useResponsive = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return isMobile;
};

interface SplitterProps {
  children: [React.ReactNode, React.ReactNode];
  storageKey: string;
  initialSize?: number; // As percentage
  minSize?: number;     // As percentage
  maxSize?: number;     // As percentage
}

export const VerticalSplitter: React.FC<SplitterProps> = ({ children, storageKey, initialSize = 50, minSize = 20, maxSize = 80 }) => {
    const isMobile = useResponsive();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const [size, setSize] = useState(() => {
        try {
            const savedPercentage = localStorage.getItem(storageKey);
            return savedPercentage ? JSON.parse(savedPercentage) : initialSize;
        } catch (e) {
            return initialSize;
        }
    });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const gap = 24; // Corresponds to gap-6 in Tailwind (1.5rem)
                setContainerWidth(entries[0].contentRect.width - gap);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const onResize = useCallback((event: any, { size: newSize }: { size: { width: number } }) => {
        if (containerWidth > 0) {
            const newPercentage = (newSize.width / containerWidth) * 100;
            setSize(newPercentage);
            localStorage.setItem(storageKey, JSON.stringify(newPercentage));
        }
    }, [containerWidth, storageKey]);

    if (isMobile) {
        return <div className="flex flex-col h-full w-full gap-6">{children[0]}<div className="flex-grow min-h-[300px]">{children[1]}</div></div>;
    }

    const widthInPixels = containerWidth > 0 ? (containerWidth * size) / 100 : 0;
    const minPixels = containerWidth > 0 ? (containerWidth * minSize) / 100 : 0;
    const maxPixels = containerWidth > 0 ? (containerWidth * maxSize) / 100 : Infinity;

    return (
        <div className="flex h-full w-full gap-6" ref={containerRef}>
            {containerWidth > 0 && (
                <>
                    <ResizableBox
                        width={widthInPixels}
                        height={Infinity}
                        onResize={onResize}
                        axis="x"
                        minConstraints={[minPixels, Infinity]}
                        maxConstraints={[maxPixels, Infinity]}
                        handle={<span className="splitter-handle-vertical" />}
                        className="!h-full"
                    >
                        <div className="h-full w-full overflow-hidden">
                            {children[0]}
                        </div>
                    </ResizableBox>
                    <div className="flex-1 h-full overflow-hidden">
                        {children[1]}
                    </div>
                </>
            )}
        </div>
    );
};


export const HorizontalSplitter: React.FC<SplitterProps> = ({ children, storageKey, initialSize = 50, minSize = 20, maxSize = 80 }) => {
    const isMobile = useResponsive();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);

    const [size, setSize] = useState(() => {
        try {
            const savedPercentage = localStorage.getItem(storageKey);
            return savedPercentage ? JSON.parse(savedPercentage) : initialSize;
        } catch (e) {
            return initialSize;
        }
    });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const gap = 24; // Corresponds to gap-6 in Tailwind (1.5rem)
                setContainerHeight(entries[0].contentRect.height - gap);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const onResize = useCallback((event: any, { size: newSize }: { size: { height: number } }) => {
        if (containerHeight > 0) {
            const newPercentage = (newSize.height / containerHeight) * 100;
            setSize(newPercentage);
            localStorage.setItem(storageKey, JSON.stringify(newPercentage));
        }
    }, [containerHeight, storageKey]);


    if (isMobile) {
         return <div className="flex flex-col h-full w-full gap-6">{children[0]}<div className="flex-grow min-h-[300px]">{children[1]}</div></div>;
    }

    const heightInPixels = containerHeight > 0 ? (containerHeight * size) / 100 : 0;
    const minPixels = containerHeight > 0 ? (containerHeight * minSize) / 100 : 0;
    const maxPixels = containerHeight > 0 ? (containerHeight * maxSize) / 100 : Infinity;

    return (
        <div className="flex flex-col h-full w-full gap-6" ref={containerRef}>
             {containerHeight > 0 && (
                <>
                    <ResizableBox
                        width={Infinity}
                        height={heightInPixels}
                        onResize={onResize}
                        axis="y"
                        minConstraints={[Infinity, minPixels]}
                        maxConstraints={[Infinity, maxPixels]}
                        handle={<span className="splitter-handle-horizontal" />}
                        className="!w-full"
                    >
                        <div className="h-full w-full overflow-hidden">
                            {children[0]}
                        </div>
                    </ResizableBox>
                    <div className="flex-1 w-full overflow-hidden">
                        {children[1]}
                    </div>
                </>
             )}
        </div>
    );
};