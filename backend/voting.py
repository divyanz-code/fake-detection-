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
                
        # Strict Single-Fake Threshold Rule (User Directive):
        # 1. If EVEN 1 model predicts "fake" (fake_votes >= 1) or fails to predict, overall result is "fake".
        # 2. Overall result is "real" ONLY when ALL models (100%) predict "real" (fake_votes == 0).
        
        # Count missing/invalid predictions as "fake"
        total_models = max(4, len(predictions))
        missing_count = total_models - len(predictions)
        fake_votes += missing_count

        for _ in range(missing_count):
            fake_scores.append(1.0)
            real_scores.append(0.0)

        if fake_votes >= 1:
            final_pred = "fake"
            final_conf = max(fake_scores) # Use max fake score or avg fake score
        else:
            final_pred = "real"
            final_conf = sum(real_scores) / len(real_scores)
            
        return final_pred, round(float(final_conf), 4)
