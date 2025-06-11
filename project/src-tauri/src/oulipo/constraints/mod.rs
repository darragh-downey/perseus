
//! # Oulipo Constraints
//! 
//! This module contains implementations of classical and experimental Oulipo constraints.
//! Each constraint can be used both as a standalone function or through the trait system.

// Classical Oulipo constraints
pub mod lipogram;
pub mod n_plus_7;
pub mod palindrome;
pub mod snowball;
pub mod sestina;

// Extended experimental constraints
pub mod prisoners;
pub mod univocalic;

// Re-export constraint structs for trait-based usage
pub use univocalic::UnivocalicConstraint;

// Re-export common constraint functions for backward compatibility
pub use lipogram::check as check_lipogram;
pub use palindrome::check as check_palindrome;
pub use snowball::check as check_snowball;
pub use prisoners::check as check_prisoners;
pub use univocalic::check as check_univocalic;
pub use sestina::check as check_sestina;
pub use n_plus_7::transform as n_plus_7_transform;
