import classNames, { ArgumentArray } from "classnames";

const cn = (...inputs: ArgumentArray): string => classNames(...inputs);
export default cn