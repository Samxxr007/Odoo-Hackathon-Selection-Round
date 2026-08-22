import { getWorkingDaysInMonth, calcPayableDays } from './workingDaysService'

describe('workingDaysService tests', () => {
  test('calcPayableDays properly deducts unpaid leave and absence', () => {
    // 22 working days, 2 days unpaid leave, 1 day absent -> 19 payable days
    const payable = calcPayableDays(22, 2, 1)
    expect(payable).toBe(19)
  })

  test('calcPayableDays does not go below zero', () => {
    const payable = calcPayableDays(20, 25, 5)
    expect(payable).toBe(0)
  })

  test('calcPayableDays with 0 unpaid and 0 absent returns full working days', () => {
    const payable = calcPayableDays(21, 0, 0)
    expect(payable).toBe(21)
  })
})
