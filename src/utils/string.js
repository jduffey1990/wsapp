import moment from "moment";

export const formatDate = (date, format = 'MM/DD/YYYY') => {
    return moment(date).format(format);
};

export function stringIsEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}