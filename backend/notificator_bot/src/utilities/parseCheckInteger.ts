export function parseCheckInteger ( data: number | string ) {
  const number = typeof data === 'string' ? +data : data;
  if ( isNaN( number )) throw new Error(data + ' cannot be parsed to integer')
  return number
}

export default parseInt