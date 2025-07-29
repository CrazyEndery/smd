import networkx as nx
from typing import List, Dict, Any

def build_graph(entities: List[Dict[str, Any]]) -> nx.MultiDiGraph:
    G = nx.MultiDiGraph()
    for e in entities:
        node_id = e["text"].lower()
        G.add_node(node_id, label=e["label"])
        # example: simple “co-occurs-in-sentence” relation
        G.add_edge(e["sentence"][:32], node_id, relation="mentions")
    return G

def to_json(G: nx.MultiDiGraph):
    nodes = [{"id": n, "label": d["label"]} for n, d in G.nodes(data=True)]
    edges = [
        {"source": u, "target": v, "relation": d["relation"]}
        for u, v, d in G.edges(data=True)
    ]
    return {"nodes": nodes, "edges": edges}
