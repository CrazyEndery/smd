def test_train_ner_exists():
    import importlib.util
    assert importlib.util.find_spec("src.models.train_ner") is not None 