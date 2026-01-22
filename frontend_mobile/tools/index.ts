

export const formatPrice = (price: string | number) => {
    return Number(price).toLocaleString('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
    });
};