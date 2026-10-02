/** {name} in a message becomes the customer's first name. Safe to use in the browser. */
export const firstName = (n: string) => n.trim().split(/\s+/)[0] || n;
export const personalise = (msg: string, name: string) => msg.replace(/\{name\}/gi, firstName(name));
