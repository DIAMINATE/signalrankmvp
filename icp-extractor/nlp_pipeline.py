"""
NLP Processing: NER, Sentiment Analysis, Topic Modeling.
"""

from typing import Dict, List, Optional

import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF


def _ensure_nltk() -> None:
    for resource in ["vader_lexicon", "punkt", "punkt_tab", "stopwords"]:
        try:
            nltk.data.find(f"tokenizers/{resource}")
        except LookupError:
            nltk.download(resource, quiet=True)


class NLPPipeline:
    """NER, Sentiment, Topic Modeling."""

    def __init__(self, nlp=None):
        self.nlp = nlp
        _ensure_nltk()
        self.sia = SentimentIntensityAnalyzer()

    def run_ner(self, text: str) -> Dict[str, List[str]]:
        """Named Entity Recognition - extract ORG, PERSON, MONEY."""
        if not self.nlp or not text:
            return {"ORG": [], "PERSON": [], "MONEY": []}
        from collections import defaultdict

        doc = self.nlp(text[:100000])
        entities: Dict[str, List[str]] = defaultdict(list)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PERSON", "MONEY"]:
                entities[ent.label_].append(ent.text)
        return {k: list(set(v))[:20] for k, v in entities.items()}

    def run_sentiment(self, text: str) -> Dict[str, float]:
        """Sentiment analysis on full text."""
        if not text:
            return {"compound": 0, "neg": 0, "neu": 0, "pos": 0}
        return self.sia.polarity_scores(text)

    def run_topic_modeling(
        self, documents: List[str], n_topics: int = 5, n_top_words: int = 5
    ) -> List[List[str]]:
        """
        Topic modeling via NMF on TF-IDF.
        Returns list of topics, each topic = list of top words.
        """
        docs = [d for d in documents if d and len(d.strip()) > 50]
        if len(docs) < 2 or n_topics < 1:
            return []

        try:
            vectorizer = TfidfVectorizer(
                max_features=500,
                stop_words="english",
                ngram_range=(1, 2),
                min_df=1,
            )
            X = vectorizer.fit_transform(docs)
            n_comp = min(n_topics, X.shape[1], X.shape[0], len(docs))
            if n_comp < 1:
                return []
            nmf = NMF(n_components=n_comp, random_state=42)
            nmf.fit_transform(X)
            feature_names = vectorizer.get_feature_names_out()
            H = nmf.components_

            topics = []
            for i in range(H.shape[0]):
                top_indices = H[i].argsort()[::-1][:n_top_words]
                topic_words = [
                    feature_names[j]
                    for j in top_indices
                    if j < len(feature_names)
                ]
                if topic_words:
                    topics.append(topic_words)
            return topics
        except Exception:
            return []

    def process(
        self,
        pages_content: Dict[str, Dict],
        extracted_data: Dict,
    ) -> Dict:
        """
        Run full NLP pipeline and augment extracted_data.
        """
        all_text = " ".join(
            [p.get("clean_text", "") for p in pages_content.values() if p]
        )
        documents = [
            p.get("clean_text", "")
            for p in pages_content.values()
            if p and p.get("clean_text")
        ]

        if self.nlp:
            ner = self.run_ner(all_text)
            extracted_data["entities"] = ner

        extracted_data["sentiment"] = self.run_sentiment(all_text)
        extracted_data["topics"] = self.run_topic_modeling(
            documents, n_topics=5, n_top_words=5
        )

        return extracted_data
