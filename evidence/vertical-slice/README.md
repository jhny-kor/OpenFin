# Verified vertical slice audit

`vertical-slice-report.json` is an auditable gap report for the first release
slice: 20 deposit products and 20 saving products.

The report counts value completeness, field assertions, official-source
assertions, field-level verification, and runtime eligibility separately. It
does not create assertions or promote a product. A product can only enter the
verified count when every required field has a current, non-conflicting,
field-level assertion from an allowed official source.

Run from the repository root:

```bash
npm run knowledge:vertical-slice
```
