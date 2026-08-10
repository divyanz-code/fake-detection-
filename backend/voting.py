from typing import List, Dict, Tuple

class MajorityVotingEngine:
    """
    MajorityVotingEngine aggregates individual predictions from 
    different models (Face, Eye, Nose, Lips) into a single unified result.
    """
    
    @staticmethod
    def aggregate_predictions(predictions: List[Dict]) -> Tuple[str, float]:
        """
        Aggregates individual model predictions using majority voting.
        
        Args:
            predictions (list): A list of dictionaries containing individual predictions.
                               Format: [
                                  {"model": "eye", "prediction": "real", "confidence": 0.9, "scores": {"real": 0.9, "fake": 0.1}},
                                  ...
                               ]
                               
        Returns:
            Tuple[str, float]: (final_prediction, final_confidence)
                               - final_prediction: "real" or "fake"
                               - final_confidence: calculated confidence score
        """
        if not predictions:
            return "uncertain", 0.0
            
        real_votes = 0
        fake_votes = 0
        
        real_scores = []
        fake_scores = []
        
        for pred in predictions:
            pred_class = pred["prediction"].lower()
            confidence = pred["confidence"]
            
            # Extract probability scores if present
            scores = pred.get("scores", {})
            real_prob = scores.get("real", 1.0 if pred_class == "real" else 0.0)
            fake_prob = scores.get("fake", 1.0 if pred_class == "fake" else 0.0)
            
            real_scores.append(real_prob)
            fake_scores.append(fake_prob)
            
            if pred_class == "fake":
                fake_votes += 1
            else:
                real_votes += 1
                
        # 1. Calculate winning class based on majority vote
        if fake_votes > real_votes:
            final_pred = "fake"
        elif real_votes > fake_votes:
            final_pred = "real"
        else:
            # 2. Tie-breaker: 2 vs 2.
            # Decided by the class with the higher average probability across all models.
            avg_real_prob = sum(real_scores) / len(real_scores)
            avg_fake_prob = sum(fake_scores) / len(fake_scores)
            
            if avg_fake_prob >= avg_real_prob:
                final_pred = "fake"
            else:
                final_pred = "real"
                
        # 3. Calculate Final Confidence Score:
        # We calculate the average confidence/probability of the winning class
        # across all models to represent the overall system certainty.
        if final_pred == "real":
            final_conf = sum(real_scores) / len(real_scores)
        else:
            final_conf = sum(fake_scores) / len(fake_scores)
            
        return final_pred, round(float(final_conf), 4)
