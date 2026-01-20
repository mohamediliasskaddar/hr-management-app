/**
 * Utilitaire pour gérer les erreurs asynchrones dans les contrôleurs Express
 * Évite de devoir écrire try/catch dans chaque fonction async
 *
 * Exemple d'utilisation :
 * exports.getAllUsers = catchAsync(async (req, res, next) => {
 *   const users = await User.find();
 *   res.status(200).json({ status: 'success', data: users });
 * });
 *
 * @param {Function} fn - La fonction asynchrone du contrôleur
 * @returns {Function} - Middleware Express qui gère les erreurs
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};