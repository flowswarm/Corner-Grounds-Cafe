import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus, Check, X } from 'lucide-react';
import { CustomizationTile as TileData, CustomizationOption } from '../data/menuData';

interface SelectedValue {
    option: string;
    quantity?: number;
}

interface CustomizationTileProps {
    tile: TileData;
    value?: SelectedValue;
    onChange: (tileId: string, value: SelectedValue | null) => void;
}

const CustomizationTile: React.FC<CustomizationTileProps> = ({ tile, value, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const tileRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tileRef.current && !tileRef.current.contains(e.target as Node)) {
                setIsExpanded(false);
            }
        };
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const handleSelectOption = (opt: CustomizationOption) => {
        const newValue: SelectedValue = {
            option: opt.label,
            quantity: opt.hasQuantity ? (opt.default || 1) : undefined,
        };
        onChange(tile.id, newValue);
        setIsExpanded(false);
    };

    const handleQuantityChange = (delta: number) => {
        if (!value) return;
        const opt = tile.options?.find(o => o.label === value.option);
        const max = opt?.maxQuantity || 12;
        const newQty = Math.max(0, Math.min(max, (value.quantity || 1) + delta));
        if (newQty === 0) {
            onChange(tile.id, null);
        } else {
            onChange(tile.id, { ...value, quantity: newQty });
        }
    };

    const handleClear = () => {
        onChange(tile.id, null);
    };

    // ── Counter type tile (like Shots) ───────────────────────────────────
    if (tile.type === 'counter') {
        const counterValue = value?.quantity ?? tile.defaultQuantity ?? 0;
        return (
            <div ref={tileRef} className="customization-tile customization-tile--counter">
                <div className="customization-tile__counter-row">
                    <span className="customization-tile__label">{tile.label}</span>
                    <div className="customization-tile__counter-controls">
                        <button
                            className="customization-tile__counter-btn"
                            onClick={() => {
                                const newQty = Math.max(0, counterValue - 1);
                                onChange(tile.id, newQty > 0 ? { option: tile.label, quantity: newQty } : null);
                            }}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="customization-tile__counter-value">{counterValue}</span>
                        <button
                            className="customization-tile__counter-btn"
                            onClick={() => {
                                const newQty = counterValue + 1;
                                onChange(tile.id, { option: tile.label, quantity: newQty });
                            }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Dropdown type tile ───────────────────────────────────────────────
    const isSelected = !!value;
    const hasQuantity = value && value.quantity !== undefined;

    return (
        <div ref={tileRef} className={`customization-tile ${isSelected ? 'customization-tile--selected' : ''}`}>
            {/* Main tile button */}
            {!isSelected ? (
                <button
                    className="customization-tile__trigger"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="customization-tile__label">{tile.label}</span>
                    <ChevronDown className={`w-4 h-4 customization-tile__chevron ${isExpanded ? 'customization-tile__chevron--open' : ''}`} />
                </button>
            ) : (
                <div className="customization-tile__selected">
                    <div className="customization-tile__selected-info">
                        <Check className="w-3.5 h-3.5 text-caramel flex-shrink-0" />
                        <span className="customization-tile__selected-label" onClick={() => setIsExpanded(!isExpanded)}>
                            {value.option}
                        </span>
                    </div>
                    <div className="customization-tile__selected-actions">
                        {hasQuantity && (
                            <div className="customization-tile__qty-controls">
                                <button className="customization-tile__qty-btn" onClick={() => handleQuantityChange(-1)}>
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="customization-tile__qty-value">{value.quantity}</span>
                                <button className="customization-tile__qty-btn" onClick={() => handleQuantityChange(1)}>
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <button className="customization-tile__clear-btn" onClick={handleClear}>
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded options dropdown */}
            <AnimatePresence>
                {isExpanded && tile.options && tile.options.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="customization-tile__dropdown"
                    >
                        <div className="customization-tile__options-list">
                            {tile.options.map((opt) => (
                                <button
                                    key={opt.label}
                                    className={`customization-tile__option ${value?.option === opt.label ? 'customization-tile__option--active' : ''}`}
                                    onClick={() => handleSelectOption(opt)}
                                >
                                    <span>{opt.label}</span>
                                    {value?.option === opt.label && <Check className="w-3.5 h-3.5 text-caramel" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomizationTile;
