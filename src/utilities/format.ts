export class Format {

  usSymbols = {
    symbol: '$', // símbolo
    decimal: '.', // separador de decimal
    thousands: ',', // separador de milhares
  }

  ptBrSymbols = {
    symbol: 'R$', // símbolo
    decimal: ',', // separador de decimal
    thousands: '.', // separador de milhares
  }

  /**
   * @name currency
   * @param {number | string} value valor recebido.
   * @param {boolean | undefined} withCurrencySymbol boolean para colocar o símbolo de dinheiro ou não.
   * @param {'us' | 'pt-br'} locale indica se o valor é em Dólar ou em Real.
   * @returns string
   */
  currency(value: number | string, withCurrencySymbol: boolean = false, locale: 'us' | 'pt-br' = 'us'): string {
    const { symbol, decimal, thousands } = locale === 'us' ? this.usSymbols : this.ptBrSymbols

    if (value === '') return `0${decimal}00`

    let slice = -2
    value = value.toString()

    if (value.includes(".")) {
      if (locale === 'pt-br')
        value = value.replace(".", ",")
      if (value.slice(slice, slice + 1) === decimal) value += "0"
    } else {
      value = value + `${decimal}00`
    }
    slice -= 4

    while (slice > -value.length) {
      value = value.slice(0, slice) + thousands + value.slice(slice)
      slice -= 4
    }

    if (withCurrencySymbol)
      return value.includes('-')
        ? `- ${symbol}` + (value.replace('-', '')[0] === thousands
          ? value.replace('-', '').replace(thousands, '')
          : value.replace('-', ''))
        : `${symbol}` + value
    else
      return value
  }

  /**
   * @name currencyInInput
   * @param {number | string} value valor recebido.
   * @param {boolean | undefined} withCurrencySymbol boolean para colocar o símbolo de dinheiro ou não.
   * @param {'us' | 'pt-br'} locale indica se o valor é em Dólar ou em Real.
   * @returns string
   */
  currencyInInput(value: number | string, withCurrencySymbol: boolean = false, locale: 'us' | 'pt-br' = 'us'): string {
    const { symbol, decimal, thousands } = locale === 'us' ? this.usSymbols : this.ptBrSymbols
    value = Number(value.toString().replace(/[^\d]/g, '')).toString()

    if (value.length === 0) return `0${decimal}00`
    if (value.length === 1) return `0${decimal}0${value}`
    if (value.length === 2) return `0${decimal}${value}`

    if (value.length > 14) value = value.slice(-14)

    value = value.slice(0, -2) + decimal + value.slice(-2)
    let slice = -6
    while (slice > -value.length) {
      value = value.slice(0, slice) + thousands + value.slice(slice)
      slice -= 4
    }

    return (withCurrencySymbol ? symbol : '') + value
  }
}