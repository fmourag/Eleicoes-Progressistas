import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useThemeColors, Radius, Spacing, FontSize } from '../utils/theme';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Dropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecione...',
  disabled,
  loading,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const colors = useThemeColors();

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term));
  }, [options, search]);

  function handleOpen() {
    if (!disabled && !loading) {
      setSearch('');
      setOpen(true);
    }
  }

  function handleClose() {
    setOpen(false);
    setSearch('');
  }

  function handleSelect(val: string) {
    onSelect(val);
    handleClose();
  }

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.border },
          disabled && styles.disabled,
        ]}
        onPress={handleOpen}
        activeOpacity={0.8}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text
            style={[styles.triggerText, { color: selectedLabel ? colors.text : colors.textFaint }]}
            numberOfLines={1}
          >
            {selectedLabel || placeholder}
          </Text>
        )}
        <Text style={[styles.caret, { color: colors.textMuted }]}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Cabeçalho do Modal */}
                <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={1}>
                      {label || placeholder}
                    </Text>
                    <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
                      {filteredOptions.length} {filteredOptions.length === 1 ? 'opção disponível' : 'opções disponíveis'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Campo de Busca Rápida (quando > 8 opções) */}
                {options.length > 8 && (
                  <View style={[styles.searchBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={{ fontSize: 13, marginRight: 6 }}>🔍</Text>
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Pesquisar..."
                      placeholderTextColor={colors.textMuted}
                      value={search}
                      onChangeText={setSearch}
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    {search.length > 0 && (
                      <TouchableOpacity onPress={() => setSearch('')}>
                        <Text style={{ fontSize: 13, color: colors.textMuted, paddingHorizontal: 4 }}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Lista de Opções */}
                <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                  {filteredOptions.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                        Nenhuma opção encontrada
                      </Text>
                    </View>
                  ) : (
                    filteredOptions.map((item) => {
                      const isSelected = item.value === value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.option,
                            { borderBottomColor: colors.border },
                            isSelected && { backgroundColor: colors.primaryLight },
                          ]}
                          onPress={() => handleSelect(item.value)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              { color: isSelected ? colors.primary : colors.text },
                              isSelected && { fontWeight: '700' },
                            ]}
                          >
                            {item.label}
                          </Text>
                          {isSelected && (
                            <View style={[styles.selectedCheck, { backgroundColor: colors.primary }]}>
                              <Text style={styles.selectedCheckText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    minHeight: 46,
  },
  disabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: FontSize.base,
    flex: 1,
    marginRight: Spacing.xs,
  },
  caret: {
    fontSize: FontSize.base,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    paddingVertical: 2,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    minHeight: 46,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: FontSize.base,
    flex: 1,
  },
  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  selectedCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
