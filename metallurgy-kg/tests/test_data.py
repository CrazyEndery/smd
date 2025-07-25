import os

def test_raw_data_files_exist():
    for fname in ["train.conll", "valid.conll", "test.conll"]:
        assert os.path.exists(f"metallurgy-kg/data/raw/{fname}") 