export class Format {

  /**
   * @name currency
   * @param {number | string} value valor recebido
   * @param {boolean | undefined} withCurrencySymbol boolean para colocar o símbolo de dinheiro ou não
   * @returns string
   */
  currency(value: number | string, withCurrencySymbol: boolean = false): string {
    if (value === '') return '0,00'

    let slice = -2
    value = value.toString()

    if (value.includes(".")) {
      value = value.replace(".", ",")
      if (value.slice(slice, slice + 1) === ",") value += "0"
    } else {
      value = value + ",00"
    }
    slice -= 4

    while (slice > -value.length) {
      value = value.slice(0, slice) + "." + value.slice(slice)
      slice -= 4
    }

    if (withCurrencySymbol)
      return value.includes('-')
        ? '- R$' + (value.replace('-', '')[0] === '.'
          ? value.replace('-', '').replace('.', '')
          : value.replace('-', ''))
        : 'R$' + value
    else
      return value
  }

  /**
   * @name currencyInInput
   * @param {number | string} value valor recebido
   * @param {boolean | undefined} withCurrencySymbol boolean para colocar o símbolo de dinheiro ou não
   * @returns string
   */
  currencyInInput(value: number | string, withCurrencySymbol: boolean = false): string {
    value = Number(value.toString().replace(/[^\d]/g, '')).toString()

    if (value.length === 0) return `0,00`
    if (value.length === 1) return `0,0${value}`
    if (value.length === 2) return `0,${value}`

    if (value.length > 14) value = value.slice(-14)

    value = value.slice(0, -2) + ',' + value.slice(-2)
    let slice = -6
    while (slice > -value.length) {
      value = value.slice(0, slice) + "." + value.slice(slice)
      slice -= 4
    }

    return (withCurrencySymbol ? 'R$' : '') + value
  }
}