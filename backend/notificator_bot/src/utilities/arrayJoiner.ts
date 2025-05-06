/**
 * Предназначен для склейки двумерных массивов, работает с массивами у которых одинаковый размер строк
 * @param {'row' | 'column'} dimension
 * @param {number} [spacingLength]
 * @param {any[][]} arr
 * 
 * @returns {any[][]} новый массив содержащий shallow copy rows
 */
export function arrayJoiner(dimension: 'row' | 'column', spacer: any, spacingLength: number | any[][], ...arr: any[][]): any[][]{
  if (typeof spacingLength !== 'number'){
    arr = [spacingLength.slice(), ...arr];
    spacingLength = 0
  }

  if (dimension === 'row'){
    const arrayLengths = arr.map(e => e.length);
    const maxLength = Math.max(...arrayLengths);
    const space = spacingLength ? new Array(spacingLength).fill(spacer) : []; 

    return arrayLengths.reduce((result: undefined | any[], e, el) => {
      const array = arr[el]
      const rowLength = array[0].length;

      while (e < maxLength){
        e = array.push(new Array(rowLength).fill(''));
      };

      if (! result) return array;

      result.forEach((row, rowIx) => row.push(...space,...array[rowIx]));

      return result
    }, undefined) as any[][]
  } else if (dimension === 'column'){
    
    const rowLengths = arr.map(e => e[0].length);
    const maxLength = Math.max(...rowLengths);
    const space = spacingLength ? new Array(spacingLength).fill(new Array(maxLength).fill(spacer)) : [];
    // console.log(spacingLength)

    return rowLengths.reduce((result: any[], e, el) => {
      const array = arr[el]
      const cellsToAdd = maxLength - e;

      cellsToAdd &&  array.forEach(row => row.push(...new Array(cellsToAdd).fill('')))
      if (! result) return array;
      result.push(...space, ...array);

      return result
    }, undefined)
  } else {
    throw new Error('Unsupported direction type, select SpreadsheetApp.Dimension enum to select type!');
  }
}