import dayjs from 'dayjs';
export const formatSlotLabel = (iso) => dayjs(iso).format('DD MMM • HH:mm');
