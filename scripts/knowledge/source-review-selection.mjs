const reviewTime = review => {
  const value = Date.parse(review?.evaluated_at || '');
  return Number.isFinite(value) ? value : null;
};

const invalidReview = review => review?.review_status === 'rejected'
  || (Array.isArray(review?.reason_codes) && review.reason_codes.includes('REVOKED'));

// A generated pending duplicate must not erase an explicit review. A newer
// rejection or revocation does erase an earlier verification; malformed dates
// fail closed when an invalidating record is involved.
export const preferredSourceReview = (left, right) => {
  if (!left) return right;
  if (!right) return left;
  const leftInvalid = invalidReview(left);
  const rightInvalid = invalidReview(right);
  if (leftInvalid || rightInvalid) {
    if (leftInvalid && rightInvalid) return (reviewTime(right) ?? Infinity) >= (reviewTime(left) ?? Infinity) ? right : left;
    const invalid = leftInvalid ? left : right;
    const other = leftInvalid ? right : left;
    const invalidTime = reviewTime(invalid);
    const otherTime = reviewTime(other);
    if (invalidTime === null || otherTime === null || invalidTime >= otherTime) return invalid;
    return other;
  }
  if (left.review_status === 'pending' && right.review_status !== 'pending') return right;
  if (left.review_status !== 'pending' && right.review_status === 'pending') return left;
  return (reviewTime(right) ?? -Infinity) >= (reviewTime(left) ?? -Infinity) ? right : left;
};
