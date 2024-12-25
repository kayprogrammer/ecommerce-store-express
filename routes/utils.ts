const isPartOfEnum = (value: string, enumType: any): boolean => {
    return Object.values(enumType).includes(value);
};

export { isPartOfEnum }
