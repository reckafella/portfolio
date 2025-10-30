import { useState, useEffect, useCallback, useRef } from "react";

interface UseKeyboardNavigationOptions {
    items: any[];
    onSelect: (item: any, index: number) => void;
    onEscape?: () => void;
    enabled?: boolean;
    loop?: boolean;
}

interface UseKeyboardNavigationReturn {
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
    resetSelection: () => void;
}

export const useKeyboardNavigation = ({
    items,
    onSelect,
    onEscape,
    enabled = true,
    loop = true,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLElement | null>(null);

    // Reset selection when items change
    useEffect(() => {
        setSelectedIndex(-1);
    }, [items]);

    // Update selection when items length changes
    useEffect(() => {
        if (selectedIndex >= items.length) {
            setSelectedIndex(Math.max(-1, items.length - 1));
        }
    }, [items.length, selectedIndex]);

    const resetSelection = useCallback(() => {
        setSelectedIndex(-1);
    }, []);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (!enabled || items.length === 0) return;

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setSelectedIndex((prev) => {
                        if (prev === -1) return 0;
                        if (prev < items.length - 1) return prev + 1;
                        return loop ? 0 : prev;
                    });
                    break;

                case "ArrowUp":
                    event.preventDefault();
                    setSelectedIndex((prev) => {
                        if (prev === -1) return items.length - 1;
                        if (prev > 0) return prev - 1;
                        return loop ? items.length - 1 : prev;
                    });
                    break;

                case "Enter":
                    event.preventDefault();
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        onSelect(items[selectedIndex], selectedIndex);
                    }
                    break;

                case "Escape":
                    event.preventDefault();
                    resetSelection();
                    onEscape?.();
                    break;

                case "Tab":
                    // Allow default tab behavior, but reset selection
                    resetSelection();
                    break;

                default:
                    // For any other key, reset selection
                    if (selectedIndex !== -1) {
                        resetSelection();
                    }
                    break;
            }
        },
        [
            enabled,
            items,
            selectedIndex,
            onSelect,
            onEscape,
            loop,
            resetSelection,
        ],
    );

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && containerRef.current) {
            const selectedElement = containerRef.current.querySelector(
                `[data-index="${selectedIndex}"]`,
            ) as HTMLElement;

            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                });
            }
        }
    }, [selectedIndex]);

    return {
        selectedIndex,
        setSelectedIndex,
        handleKeyDown,
        resetSelection,
    };
};
