import networkx as nx
from typing import List, Dict, Any

def build_graph(entities):
    G = nx.MultiDiGraph()
    for e in entities:
        node_id = e["text"].lower()
        G.add_node(node_id, label=e["label"])  # сущность с ярлыком

        # Добавьте контекст, если узел еще не существует:
        context_id = e["sentence"][:32]
        if context_id not in G.nodes:
            G.add_node(context_id, label="context")
        G.add_edge(context_id, node_id, relation="mentions")
    return G


def to_json(G):
    nodes = [{"id": n, "label": d.get("label", "unknown")} for n, d in G.nodes(data=True)]
    edges = [
        {"source": u, "target": v, "relation": d["relation"]}
        for u, v, d in G.edges(data=True)
    ]
    return {"nodes": nodes, "edges": edges}
